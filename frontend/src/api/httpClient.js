const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, { method = "GET", headers, body } = {}) {
	const res = await fetch(`${API_BASE_URL}${path}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			...(headers || {}),
		},
		body: body ? JSON.stringify(body) : undefined,
	});

	const contentType = res.headers.get("content-type") || "";
	const data = contentType.includes("application/json") ? await res.json() : await res.text();

	if (!res.ok) {
		const message = typeof data === "object" && data?.error ? data.error : `Request failed (${res.status})`;
		const err = new Error(message);
		err.status = res.status;
		err.data = data;
		throw err;
	}

	return data;
}

export const httpClient = { request };
