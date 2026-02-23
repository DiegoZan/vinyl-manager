import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { createTestDb } from "./helpers/testDb.js";

describe("PATCH /api/collection-items/:id", () => {
	it("updates editable fields and reflects them in GET /api/releases/:id", async () => {
		const db = await createTestDb();
		const app = createApp({ db });

		// 1) Create a manual release -> creates release + collection item
		const createRes = await request(app).post("/api/releases/manual").send({ title: "Kind of Blue", year: 1959 });

		expect(createRes.status).toBe(201);
		expect(createRes.body.releaseId).toBeTypeOf("number");
		expect(createRes.body.collectionItemId).toBeTypeOf("number");

		const releaseId = createRes.body.releaseId;
		const collectionItemId = createRes.body.collectionItemId;

		// 2) Patch the collection item
		const patchRes = await request(app).patch(`/api/collection-items/${collectionItemId}`).send({
			location: "Shelf A - Top",
			mediaCondition: "NM",
			sleeveCondition: "VG+",
			purchaseDate: "2026-02-23",
			purchasePriceCents: 1999,
			currency: "EUR",
			notes: "First pressing (test note).",
		});

		expect(patchRes.status).toBe(200);
		expect(patchRes.body).toEqual({ ok: true });

		// 3) Fetch release details and verify the updated fields are present
		const detailsRes = await request(app).get(`/api/releases/${releaseId}`);
		expect(detailsRes.status).toBe(200);

		const items = detailsRes.body.collectionItems;
		expect(Array.isArray(items)).toBe(true);
		expect(items.length).toBe(1);

		const item = items[0];
		expect(item.id).toBe(collectionItemId);
		expect(item.location).toBe("Shelf A - Top");
		expect(item.mediaCondition).toBe("NM");
		expect(item.sleeveCondition).toBe("VG+");
		expect(item.purchaseDate).toBe("2026-02-23");
		expect(item.purchasePriceCents).toBe(1999);
		expect(item.currency).toBe("EUR");
		expect(item.notes).toBe("First pressing (test note).");
	});

	it("returns 400 when purchaseDate is not YYYY-MM-DD", async () => {
		const db = await createTestDb();
		const app = createApp({ db });

		const createRes = await request(app).post("/api/releases/manual").send({ title: "Test", year: 2000 });

		const collectionItemId = createRes.body.collectionItemId;

		const patchRes = await request(app)
			.patch(`/api/collection-items/${collectionItemId}`)
			.send({ purchaseDate: "23/02/2026" });

		expect(patchRes.status).toBe(400);
		expect(patchRes.body.error).toMatch(/purchaseDate/i);
	});

	it("returns 404 when collection item does not exist", async () => {
		const db = await createTestDb();
		const app = createApp({ db });

		const patchRes = await request(app).patch(`/api/collection-items/999999`).send({ location: "Nowhere" });

		expect(patchRes.status).toBe(404);
	});
});
