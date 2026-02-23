import { Router } from "express";
import { all, run } from "../db/database.js";

export function createCollectionItemsRouter({ db }) {
	const router = Router();

	// GET /api/collection-items?q=&status=&limit=&offset=
	router.get("/", async (req, res) => {
		const q = String(req.query.q ?? "").trim();
		const status = String(req.query.status ?? "").trim();
		const limit = Math.min(Number(req.query.limit ?? 50), 200);
		const offset = Math.max(Number(req.query.offset ?? 0), 0);

		const where = [];
		const params = [];

		if (status) {
			where.push("ci.status = ?");
			params.push(status);
		}

		if (q) {
			// Simple search across release title and artist names and tracks
			where.push(`
        (
          r.title LIKE ?
          OR EXISTS (
            SELECT 1
            FROM release_artists ra
            JOIN artists a ON a.id = ra.artist_id
            WHERE ra.release_id = r.id AND a.name LIKE ?
          )
          OR EXISTS (
            SELECT 1
            FROM tracks t
            WHERE t.release_id = r.id AND t.title LIKE ?
          )
          OR r.catno_main LIKE ?
          OR EXISTS (
            SELECT 1
            FROM barcodes b
            WHERE b.release_id = r.id AND b.value LIKE ?
          )
        )
      `);
			const like = `%${q}%`;
			params.push(like, like, like, like, like);
		}

		const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

		const rows = await all(
			db,
			`
      SELECT
        ci.id AS collectionItemId,
        ci.status,
        ci.media_condition AS mediaCondition,
        ci.sleeve_condition AS sleeveCondition,
        ci.location,
        ci.notes,
        r.id AS releaseId,
        r.title,
        r.year,
        r.cover_image_url AS coverImageUrl
      FROM collection_items ci
      JOIN releases r ON r.id = ci.release_id
      ${whereSql}
      ORDER BY ci.created_at DESC
      LIMIT ?
      OFFSET ?
      `,
			[...params, limit, offset],
		);

		res.json({ items: rows, limit, offset });
	});

	// PATCH /api/collection-items/:id/status
	router.patch("/:id/status", async (req, res) => {
		const id = Number(req.params.id);
		const status = String(req.body?.status ?? "").trim();

		const allowed = new Set(["active", "sold", "lost", "broken", "traded"]);
		if (!Number.isFinite(id) || id <= 0) {
			return res.status(400).json({ error: "Invalid collection item id." });
		}
		if (!allowed.has(status)) {
			return res.status(400).json({ error: "Invalid status." });
		}

		const result = await run(db, `UPDATE collection_items SET status = ? WHERE id = ?`, [status, id]);

		if (result.changes === 0) {
			return res.status(404).json({ error: "Collection item not found." });
		}

		return res.json({ ok: true });
	});

	return router;
}
