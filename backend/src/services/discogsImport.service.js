// backend/src/services/discogsImport.service.js

import { all, get, run, exec } from "../db/database.js";

async function upsertRelease(db, release) {
	// If discogs_release_id exists -> update; else insert.
	const existing = await get(db, `SELECT id FROM releases WHERE discogs_release_id = ?`, [release.discogsReleaseId]);

	if (!existing) {
		const inserted = await run(
			db,
			`
      INSERT INTO releases (
        discogs_release_id, discogs_master_id, title, year, country, format, genres, styles,
        label_main, catno_main, cover_image_url, resource_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
			[
				release.discogsReleaseId,
				release.discogsMasterId,
				release.title,
				release.year,
				release.country,
				release.format,
				release.genres,
				release.styles,
				release.labelMain,
				release.catnoMain,
				release.coverImageUrl,
				release.resourceUrl,
			],
		);
		return inserted.lastID;
	}

	await run(
		db,
		`
    UPDATE releases
    SET
      discogs_master_id = ?,
      title = ?,
      year = ?,
      country = ?,
      format = ?,
      genres = ?,
      styles = ?,
      label_main = ?,
      catno_main = ?,
      cover_image_url = ?,
      resource_url = ?
    WHERE discogs_release_id = ?
    `,
		[
			release.discogsMasterId,
			release.title,
			release.year,
			release.country,
			release.format,
			release.genres,
			release.styles,
			release.labelMain,
			release.catnoMain,
			release.coverImageUrl,
			release.resourceUrl,
			release.discogsReleaseId,
		],
	);

	return existing.id;
}

async function getOrCreateArtistId(db, name) {
	const existing = await get(db, `SELECT id FROM artists WHERE name = ?`, [name]);
	if (existing) return existing.id;

	const inserted = await run(db, `INSERT INTO artists (name) VALUES (?)`, [name]);
	return inserted.lastID;
}

async function getOrCreateLabelId(db, name) {
	const existing = await get(db, `SELECT id FROM labels WHERE name = ?`, [name]);
	if (existing) return existing.id;

	const inserted = await run(db, `INSERT INTO labels (name) VALUES (?)`, [name]);
	return inserted.lastID;
}

async function replaceReleaseArtists(db, releaseId, artists) {
	await run(db, `DELETE FROM release_artists WHERE release_id = ?`, [releaseId]);

	for (const a of artists) {
		const artistId = await getOrCreateArtistId(db, a.name);
		await run(
			db,
			`
      INSERT INTO release_artists (release_id, artist_id, role, position)
      VALUES (?, ?, ?, ?)
      `,
			[releaseId, artistId, a.role, a.position],
		);
	}
}

async function replaceReleaseLabels(db, releaseId, labels) {
	await run(db, `DELETE FROM release_labels WHERE release_id = ?`, [releaseId]);

	for (const l of labels) {
		const labelId = await getOrCreateLabelId(db, l.name);
		// catno is NOT NULL in schema; fallback to empty string
		const catno = l.catno ?? "";
		await run(
			db,
			`
      INSERT INTO release_labels (release_id, label_id, catno, position)
      VALUES (?, ?, ?, ?)
      `,
			[releaseId, labelId, catno, l.position],
		);
	}
}

async function replaceTracks(db, releaseId, tracks) {
	await run(db, `DELETE FROM tracks WHERE release_id = ?`, [releaseId]);

	for (const t of tracks) {
		await run(
			db,
			`
      INSERT INTO tracks (release_id, position, title, duration, track_index)
      VALUES (?, ?, ?, ?, ?)
      `,
			[releaseId, t.position, t.title, t.duration, t.trackIndex],
		);
	}
}

async function replaceBarcodes(db, releaseId, barcodes) {
	await run(db, `DELETE FROM barcodes WHERE release_id = ?`, [releaseId]);

	for (const value of barcodes) {
		await run(
			db,
			`
      INSERT INTO barcodes (release_id, value)
      VALUES (?, ?)
      `,
			[releaseId, value],
		);
	}
}

async function createCollectionItem(db, releaseId) {
	const inserted = await run(
		db,
		`
    INSERT INTO collection_items (release_id, status)
    VALUES (?, 'active')
    `,
		[releaseId],
	);
	return inserted.lastID;
}

/**
 * Persists a mapped Discogs release into our database.
 * - Upserts release
 * - Replaces related tables (artists, labels, tracks, barcodes)
 * - Creates a new collection item (active)
 *
 * Returns { releaseId, collectionItemId }
 */
export async function importDiscogsRelease(db, mapped) {
	await exec(db, "BEGIN");

	try {
		const releaseId = await upsertRelease(db, mapped.release);

		await replaceReleaseArtists(db, releaseId, mapped.artists);
		await replaceReleaseLabels(db, releaseId, mapped.labels);
		await replaceTracks(db, releaseId, mapped.tracks);
		await replaceBarcodes(db, releaseId, mapped.barcodes);

		const collectionItemId = await createCollectionItem(db, releaseId);

		await exec(db, "COMMIT");

		return { releaseId, collectionItemId };
	} catch (err) {
		await exec(db, "ROLLBACK");
		throw err;
	}
}
