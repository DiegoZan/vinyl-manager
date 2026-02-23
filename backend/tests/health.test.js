import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { createTestDb } from "./helpers/testDb.js";

describe("GET /api/health", () => {
	it("returns ok", async () => {
		const db = await createTestDb();
		const app = createApp({ db });

		const res = await request(app).get("/api/health");

		expect(res.status).toBe(200);
		expect(res.body).toEqual({ status: "ok" });
	});
});
