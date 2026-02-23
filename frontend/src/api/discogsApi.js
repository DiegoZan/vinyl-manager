import { httpClient } from "./httpClient";

export function discogsSearch(params = {}) {
	const sp = new URLSearchParams();

	// supported: barcode, artist, title, catno, track, type, perPage, page
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null) continue;
		const str = String(value).trim();
		if (!str) continue;
		sp.set(key, str);
	}

	const qs = sp.toString() ? `?${sp.toString()}` : "";
	return httpClient.request(`/discogs/search${qs}`);
}
