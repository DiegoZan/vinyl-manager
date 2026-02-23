import { initDb } from "../../src/db/database.js";

export async function createTestDb() {
	// In-memory DB for test process
	const db = await initDb(":memory:");
	return db;
}
