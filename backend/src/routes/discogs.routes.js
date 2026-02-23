// backend/src/routes/discogs.routes.js

import { Router } from "express";
import { getRelease, searchDatabase } from "../services/discogs.service.js";

export function createDiscogsRouter() {
	const router = Router();

	/**
	 * GET /api/discogs/search
	 * Query params (optional):
	 * - barcode
	 * - artist
	 * - title
	 * - catno
	 * - track
	 * - type (release|master|artist|label)
	 * - perPage
	 * - page
	 */
	router.get("/search", async (req, res) => {
		try {
			const { barcode, artist, title, catno, track, type, perPage, page } = req.query;

			// Basic guard: require at least one search criterion
			const hasCriteria = [barcode, artist, title, catno, track].some((v) => String(v ?? "").trim().length > 0);
			if (!hasCriteria) {
				return res.status(400).json({
					error: "Provide at least one search parameter (barcode, artist, title, catno, track).",
				});
			}

			const result = await searchDatabase({
				barcode,
				artist,
				title,
				catno,
				track,
				type,
				perPage: perPage ? Number(perPage) : 10,
				page: page ? Number(page) : 1,
			});

			// Optional: return rate limit info to help debugging
			return res.json({
				results: result.data?.results ?? [],
				pagination: result.data?.pagination ?? null,
				rateLimit: result.rateLimit,
			});
		} catch (err) {
			const status = err.status || 502;
			return res.status(status).json({
				error: err.message || "Discogs search failed.",
				discogs: err.discogs ?? null,
				rateLimit: err.rateLimit ?? null,
			});
		}
	});

	/**
	 * GET /api/discogs/releases/:id
	 */
	router.get("/releases/:id", async (req, res) => {
		try {
			const { id } = req.params;
			const result = await getRelease(id);
			return res.json({
				release: result.data,
				rateLimit: result.rateLimit,
			});
		} catch (err) {
			const status = err.status || 502;
			return res.status(status).json({
				error: err.message || "Discogs release lookup failed.",
				discogs: err.discogs ?? null,
				rateLimit: err.rateLimit ?? null,
			});
		}
	});

	return router;
}
