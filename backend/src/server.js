import dotenv from "dotenv";
import { createApp } from "./app.js";
import { initDb } from "./db/database.js";

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const DATABASE_PATH = process.env.DATABASE_PATH || "./data/vinyl.db";

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
