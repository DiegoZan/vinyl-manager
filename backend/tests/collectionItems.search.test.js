import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { createTestDb } from "./helpers/testDb.js";

describe("GET /api/collection-items", () => {
	it("supports searching by title", async () => {
		const db = await createTestDb();
		const app = createApp({ db });

		await request(app).post("/api/releases/manual").send({ title: "Nevermind", year: 1991 });
		await request(app).post("/api/releases/manual").send({ title: "In Utero", year: 1993 });

		const res = await request(app).get("/api/collection-items?q=Never");

		expect(res.status).toBe(200);
		expect(res.body.items.length).toBe(1);
		expect(res.body.items[0].title).toBe("Nevermind");
	});
});
