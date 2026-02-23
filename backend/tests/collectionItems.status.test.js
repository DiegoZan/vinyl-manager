import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { createTestDb } from "./helpers/testDb.js";

describe("PATCH /api/collection-items/:id/status", () => {
	it("updates status and reflects it in GET /api/releases/:id", async () => {
		const db = await createTestDb();
		const app = createApp({ db });

		// Create manual release -> release + collection item
		const createRes = await request(app).post("/api/releases/manual").send({ title: "Nevermind", year: 1991 });

		expect(createRes.status).toBe(201);

		const releaseId = createRes.body.releaseId;
		const collectionItemId = createRes.body.collectionItemId;

		expect(releaseId).toBeTypeOf("number");
		expect(collectionItemId).toBeTypeOf("number");

		// Change status
		const patchRes = await request(app)
			.patch(`/api/collection-items/${collectionItemId}/status`)
			.send({ status: "sold" });

		expect(patchRes.status).toBe(200);
		expect(patchRes.body).toEqual({ ok: true });

		// Verify in release details
		const detailsRes = await request(app).get(`/api/releases/${releaseId}`);
		expect(detailsRes.status).toBe(200);

		const items = detailsRes.body.collectionItems;
		expect(items.length).toBe(1);
		expect(items[0].id).toBe(collectionItemId);
		expect(items[0].status).toBe("sold");
	});

	it("returns 400 for invalid status", async () => {
		const db = await createTestDb();
		const app = createApp({ db });

		const createRes = await request(app).post("/api/releases/manual").send({ title: "Test", year: 2000 });

		const collectionItemId = createRes.body.collectionItemId;

		const patchRes = await request(app)
			.patch(`/api/collection-items/${collectionItemId}/status`)
			.send({ status: "deleted" });

		expect(patchRes.status).toBe(400);
		expect(patchRes.body.error).toMatch(/status/i);
	});

	it("returns 404 when collection item does not exist", async () => {
		const db = await createTestDb();
		const app = createApp({ db });

		const patchRes = await request(app).patch(`/api/collection-items/999999/status`).send({ status: "lost" });

		expect(patchRes.status).toBe(404);
	});
});
