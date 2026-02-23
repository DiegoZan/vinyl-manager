import dotenv from "dotenv";
import path from "node:path";
import { createApp } from "./app.js";
import { initDb } from "./db/database.js";
import { fileURLToPath } from "node:url";

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // backend/src
const defaultDbPath = path.resolve(__dirname, "..", "data", "vinyl.db"); // backend/data/vinyl.db
const DATABASE_PATH = process.env.DATABASE_PATH ? path.resolve(process.env.DATABASE_PATH) : defaultDbPath;
console.log("Using DATABASE_PATH:", DATABASE_PATH);
async function main() {
	const db = await initDb(DATABASE_PATH);

	const app = createApp({ db });

	app.listen(PORT, () => {
		console.log(`Backend running on port ${PORT}`);
	});
}

try {
	await main();
} catch (err) {
	console.error("Failed to start server:", err);
	process.exit(1);
}
