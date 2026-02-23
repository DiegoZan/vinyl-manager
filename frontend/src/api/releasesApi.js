import { httpClient } from "./httpClient";

export function getCollectionItems({ q, status, limit, offset } = {}) {
	const sp = new URLSearchParams();
	if (q) sp.set("q", q);
	if (status) sp.set("status", status);
	if (limit != null) sp.set("limit", String(limit));
	if (offset != null) sp.set("offset", String(offset));
	const qs = sp.toString() ? `?${sp.toString()}` : "";
	return httpClient.request(`/collection-items${qs}`);
}

export function getReleaseDetails(releaseId) {
	return httpClient.request(`/releases/${releaseId}`);
}

export function createManualRelease(payload) {
	return httpClient.request(`/releases/manual`, { method: "POST", body: payload });
}

export function updateCollectionItemStatus(collectionItemId, status) {
	return httpClient.request(`/collection-items/${collectionItemId}/status`, {
		method: "PATCH",
		body: { status },
	});
}
