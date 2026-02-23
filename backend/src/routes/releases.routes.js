import { Router } from "express";
import { run, get, all } from "../db/database.js";
import { getRelease } from "../services/discogs.service.js";
import { mapDiscogsReleaseToEntities } from "../mappers/discogsRelease.mapper.js";
import { importDiscogsRelease } from "../services/discogsImport.service.js";

export function createReleasesRouter({ db }) {
	const router = Router();

	// POST /api/releases/manual
	// Creates a release (minimal fields) + a collection item linked to it.
	router.post("/manual", async (req, res) => {
		const title = String(req.body?.title ?? "").trim();
		const year = req.body?.year == null ? null : Number(req.body.year);
		const coverImageUrl = req.body?.coverImageUrl ? String(req.body.coverImageUrl).trim() : null;

		if (!title) {
			return res.status(400).json({ error: "title is required." });
		}
		if (year != null && (!Number.isInteger(year) || year < 1800 || year > 3000)) {
			return res.status(400).json({ error: "year is invalid." });
		}

		const releaseInsert = await run(
			db,
			`
      INSERT INTO releases (title, year, cover_image_url)
      VALUES (?, ?, ?)
      `,
			[title, year, coverImageUrl],
		);

		const collectionInsert = await run(
			db,
			`
      INSERT INTO collection_items (release_id, status)
      VALUES (?, 'active')
      `,
			[releaseInsert.lastID],
		);

		const created = await get(
			db,
			`
      SELECT
        ci.id AS collectionItemId,
        r.id AS releaseId,
        r.title,
        r.year,
        r.cover_image_url AS coverImageUrl,
        ci.status
      FROM collection_items ci
      JOIN releases r ON r.id = ci.release_id
      WHERE ci.id = ?
      `,
			[collectionInsert.lastID],
		);

		res.status(201).json(created);
	});

	// POST /api/releases/import/discogs/:discogsReleaseId
	router.post("/import/discogs/:discogsReleaseId", async (req, res) => {
		try {
			const discogsReleaseId = Number(req.params.discogsReleaseId);
			if (!Number.isInteger(discogsReleaseId) || discogsReleaseId <= 0) {
				return res.status(400).json({ error: "Invalid discogsReleaseId." });
			}

			const discogsResponse = await getRelease(discogsReleaseId);
			const mapped = mapDiscogsReleaseToEntities(discogsResponse.data);

			const result = await importDiscogsRelease(db, mapped);

			// Return a compact response for the frontend
			return res.status(201).json({
				ok: true,
				discogsReleaseId,
				releaseId: result.releaseId,
				collectionItemId: result.collectionItemId,
			});
		} catch (err) {
			const status = err.status || 500;
			return res.status(status).json({
				error: err.message || "Discogs import failed.",
				discogs: err.discogs ?? null,
			});
		}
	});

	// ✅ GET /api/releases/:id
	router.get("/:id", async (req, res) => {
		try {
			const releaseId = Number(req.params.id);
			if (!Number.isInteger(releaseId) || releaseId <= 0) {
				return res.status(400).json({ error: "Invalid release id." });
			}

			const release = await get(
				db,
				`
        SELECT
          id,
          discogs_release_id AS discogsReleaseId,
          discogs_master_id AS discogsMasterId,
          title,
          year,
          country,
          format,
          genres,
          styles,
          label_main AS labelMain,
          catno_main AS catnoMain,
          cover_image_url AS coverImageUrl,
          resource_url AS resourceUrl,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM releases
        WHERE id = ?
        `,
				[releaseId],
			);

			if (!release) {
				return res.status(404).json({ error: "Release not found." });
			}

			const artists = await all(
				db,
				`
        SELECT
          a.id,
          a.name,
          ra.role,
          ra.position
        FROM release_artists ra
        JOIN artists a ON a.id = ra.artist_id
        WHERE ra.release_id = ?
        ORDER BY ra.position ASC
        `,
				[releaseId],
			);

			const labels = await all(
				db,
				`
        SELECT
          l.id,
          l.name,
          rl.catno,
          rl.position
        FROM release_labels rl
        JOIN labels l ON l.id = rl.label_id
        WHERE rl.release_id = ?
        ORDER BY rl.position ASC
        `,
				[releaseId],
			);

			const tracks = await all(
				db,
				`
        SELECT
          id,
          position,
          title,
          duration,
          track_index AS trackIndex
        FROM tracks
        WHERE release_id = ?
        ORDER BY
          CASE WHEN track_index IS NULL THEN 1 ELSE 0 END,
          track_index ASC,
          id ASC
        `,
				[releaseId],
			);

			const barcodes = await all(
				db,
				`
        SELECT value
        FROM barcodes
        WHERE release_id = ?
        ORDER BY value ASC
        `,
				[releaseId],
			);

			const collectionItems = await all(
				db,
				`
        SELECT
          id,
          status,
          media_condition AS mediaCondition,
          sleeve_condition AS sleeveCondition,
          purchase_date AS purchaseDate,
          purchase_price_cents AS purchasePriceCents,
          currency,
          location,
          notes,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM collection_items
        WHERE release_id = ?
        ORDER BY created_at DESC
        `,
				[releaseId],
			);

			// Parse JSON strings if present
			const parsed = {
				...release,
				genres: release.genres ? JSON.parse(release.genres) : [],
				styles: release.styles ? JSON.parse(release.styles) : [],
			};

			return res.json({
				release: parsed,
				artists,
				labels,
				tracks,
				barcodes: barcodes.map((b) => b.value),
				collectionItems,
			});
		} catch (err) {
			return res.status(500).json({ error: err.message || "Unexpected error." });
		}
	});

	return router;
}
