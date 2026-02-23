// backend/src/services/discogs.service.js

const DISCOGS_BASE_URL = "https://api.discogs.com";

function requireEnv(name) {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

function buildAuthHeader() {
	const key = requireEnv("DISCOGS_KEY");
	const secret = requireEnv("DISCOGS_SECRET");
	return `Discogs key=${key}, secret=${secret}`;
}

function buildUserAgent() {
	// Discogs expects a User-Agent identifying your application.
	return requireEnv("DISCOGS_USER_AGENT");
}

function toQueryString(params) {
	const sp = new URLSearchParams();
	for (const [k, v] of Object.entries(params)) {
		if (v === undefined || v === null) continue;
		const str = String(v).trim();
		if (!str) continue;
		sp.set(k, str);
	}
	return sp.toString();
}

async function discogsFetch(path, { query, method = "GET" } = {}) {
	const url = new URL(`${DISCOGS_BASE_URL}${path}`);
	if (query) {
		url.search = toQueryString(query);
	}

	const controller = new AbortController();
	const timeoutMs = 15_000;
	const t = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const res = await fetch(url, {
			method,
			headers: {
				Authorization: buildAuthHeader(),
				"User-Agent": buildUserAgent(),
				Accept: "application/json",
			},
			signal: controller.signal,
		});

		const rateLimit = {
			limit: res.headers.get("X-Discogs-Ratelimit"),
			remaining: res.headers.get("X-Discogs-Ratelimit-Remaining"),
			reset: res.headers.get("X-Discogs-Ratelimit-Reset"),
		};

		let data = null;
		const contentType = res.headers.get("content-type") || "";
		if (contentType.includes("application/json")) {
			data = await res.json();
		} else {
			const text = await res.text();
			data = { raw: text };
		}

		if (!res.ok) {
			const error = new Error(`Discogs request failed: ${res.status} ${res.statusText}`);
			error.status = res.status;
			error.discogs = data;
			error.rateLimit = rateLimit;
			throw error;
		}

		return { data, rateLimit };
	} finally {
		clearTimeout(t);
	}
}

/**
 * Discogs Database Search
 * Docs: GET /database/search
 */
export async function searchDatabase({
	barcode,
	artist,
	title,
	catno,
	track,
	type, // release, master, artist, label
	perPage = 10,
	page = 1,
	format = "Vinyl",
} = {}) {
	// Discogs search supports many filters; we keep it focused.
	// For barcode search, Discogs expects "barcode" param.
	// For artist/title, you can send them separately.
	const query = {
		barcode,
		artist,
		title,
		catno,
		track,
		type,
		format, // helps narrow results (optional)
		per_page: perPage,
		page,
	};

	return discogsFetch("/database/search", { query });
}

/**
 * Get a specific release (full details including tracklist, labels, etc.)
 * Docs: GET /releases/{release_id}
 */
export async function getRelease(discogsReleaseId) {
	const id = Number(discogsReleaseId);
	if (!Number.isInteger(id) || id <= 0) {
		const err = new Error("Invalid discogsReleaseId.");
		err.status = 400;
		throw err;
	}

	return discogsFetch(`/releases/${id}`);
}
