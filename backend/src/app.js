import express from "express";
import cors from "cors";

import { createCollectionItemsRouter } from "./routes/collectionItems.routes.js";
import { createReleasesRouter } from "./routes/releases.routes.js";
import { createDiscogsRouter } from "./routes/discogs.routes.js";

export function createApp({ db }) {
	const app = express();

	app.use(cors());
	app.use(express.json());

	app.get("/api/health", (req, res) => {
		res.json({ status: "ok" });
	});

	app.use("/api/collection-items", createCollectionItemsRouter({ db }));
	app.use("/api/releases", createReleasesRouter({ db }));
	app.use("/api/discogs", createDiscogsRouter());

	return app;
}
