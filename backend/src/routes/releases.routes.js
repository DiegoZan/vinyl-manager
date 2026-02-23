import { Router } from "express";
import { run, get } from "../db/database.js";
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

	return router;
}
