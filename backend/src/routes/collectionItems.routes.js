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
					r.cover_image_url AS coverImageUrl,

					(
						SELECT a.name
						FROM release_artists ra
						JOIN artists a ON a.id = ra.artist_id
						WHERE ra.release_id = r.id
						ORDER BY ra.position ASC
						LIMIT 1
					) AS artist

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

	// PATCH /api/collection-items/:id
	router.patch("/:id", async (req, res) => {
		const id = Number(req.params.id);
		if (!Number.isFinite(id) || id <= 0) {
			return res.status(400).json({ error: "Invalid collection item id." });
		}

		const allowedGoldmine = new Set(["M", "NM", "VG+", "VG", "G+", "G", "F", "P"]);

		function normalizeGoldmine(value) {
			if (value == null) return null;
			const v = String(value).trim().toUpperCase();
			if (!v) return null;
			return allowedGoldmine.has(v) ? v : "__INVALID__";
		}

		// Allowed fields
		const mediaConditionNorm = normalizeGoldmine(req.body?.mediaCondition);
		if (mediaConditionNorm === "__INVALID__") {
			return res.status(400).json({ error: "mediaCondition must be a valid Goldmine grade (e.g., NM, VG+, VG...)." });
		}

		const sleeveConditionNorm = normalizeGoldmine(req.body?.sleeveCondition);
		if (sleeveConditionNorm === "__INVALID__") {
			return res.status(400).json({ error: "sleeveCondition must be a valid Goldmine grade (e.g., NM, VG+, VG...)." });
		}
		const location = req.body?.location == null ? null : String(req.body.location).trim() || null;
		const notes = req.body?.notes == null ? null : String(req.body.notes);

		const purchaseDate = req.body?.purchaseDate == null ? null : String(req.body.purchaseDate).trim() || null;
		const currency = req.body?.currency == null ? null : String(req.body.currency).trim().toUpperCase() || null;

		const purchasePriceCentsRaw = req.body?.purchasePriceCents;
		const purchasePriceCents =
			purchasePriceCentsRaw == null || purchasePriceCentsRaw === "" ? null : Number(purchasePriceCentsRaw);

		if (purchasePriceCents != null && (!Number.isInteger(purchasePriceCents) || purchasePriceCents < 0)) {
			return res.status(400).json({ error: "purchasePriceCents must be a non-negative integer." });
		}

		// Very light validation for ISO date-like input (YYYY-MM-DD). Keep it simple for now.
		if (purchaseDate != null && !/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) {
			return res.status(400).json({ error: "purchaseDate must be in YYYY-MM-DD format." });
		}

		if (currency != null && !/^[A-Z]{3}$/.test(currency)) {
			return res.status(400).json({ error: "currency must be a 3-letter code (e.g., EUR)." });
		}

		// Build dynamic update (only for provided keys)
		const fields = [];
		const params = [];

		if ("mediaCondition" in (req.body || {})) {
			fields.push("media_condition = ?");
			params.push(mediaConditionNorm);
		}
		if ("sleeveCondition" in (req.body || {})) {
			fields.push("sleeve_condition = ?");
			params.push(sleeveConditionNorm);
		}
		if ("location" in (req.body || {})) {
			fields.push("location = ?");
			params.push(location);
		}
		if ("notes" in (req.body || {})) {
			fields.push("notes = ?");
			params.push(notes);
		}
		if ("purchaseDate" in (req.body || {})) {
			fields.push("purchase_date = ?");
			params.push(purchaseDate);
		}
		if ("purchasePriceCents" in (req.body || {})) {
			fields.push("purchase_price_cents = ?");
			params.push(purchasePriceCents);
		}
		if ("currency" in (req.body || {})) {
			fields.push("currency = ?");
			params.push(currency);
		}

		if (fields.length === 0) {
			return res.status(400).json({ error: "No valid fields provided to update." });
		}

		params.push(id);

		const result = await run(db, `UPDATE collection_items SET ${fields.join(", ")} WHERE id = ?`, params);

		if (result.changes === 0) {
			return res.status(404).json({ error: "Collection item not found." });
		}

		return res.json({ ok: true });
	});

	return router;
}
