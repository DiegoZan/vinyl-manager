import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { createTestDb } from "./helpers/testDb.js";

describe("Releases endpoints", () => {
	it("creates a manual release and fetches it via GET /api/releases/:id", async () => {
		const db = await createTestDb();
		const app = createApp({ db });

		// Create manual release -> returns releaseId + collectionItemId
		const createRes = await request(app).post("/api/releases/manual").send({ title: "Kind of Blue", year: 1959 });

		expect(createRes.status).toBe(201);
		expect(createRes.body.title).toBe("Kind of Blue");
		expect(createRes.body.releaseId).toBeTypeOf("number");

		const releaseId = createRes.body.releaseId;

		const detailRes = await request(app).get(`/api/releases/${releaseId}`);

		expect(detailRes.status).toBe(200);
		expect(detailRes.body.release.title).toBe("Kind of Blue");
		expect(detailRes.body.collectionItems.length).toBeGreaterThan(0);

		// For manual entries, artists/labels/tracks/barcodes should be empty arrays
		expect(detailRes.body.artists).toEqual([]);
		expect(detailRes.body.labels).toEqual([]);
		expect(detailRes.body.tracks).toEqual([]);
		expect(detailRes.body.barcodes).toEqual([]);
	});

	it("returns 404 for unknown release id", async () => {
		const db = await createTestDb();
		const app = createApp({ db });

		const res = await request(app).get("/api/releases/999999");
		expect(res.status).toBe(404);
	});
});
