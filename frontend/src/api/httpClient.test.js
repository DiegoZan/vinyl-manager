import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { httpClient } from "./httpClient";

describe("httpClient.request", () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		globalThis.fetch = vi.fn();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("returns json when response is ok", async () => {
		globalThis.fetch.mockResolvedValue({
			ok: true,
			status: 200,
			headers: { get: () => "application/json" },
			json: async () => ({ hello: "world" }),
		});

		const res = await httpClient.request("/health");
		expect(res).toEqual({ hello: "world" });
	});

	it("throws error message from { error } json when response is not ok", async () => {
		globalThis.fetch.mockResolvedValue({
			ok: false,
			status: 400,
			headers: { get: () => "application/json" },
			json: async () => ({ error: "Bad request" }),
		});

		await expect(httpClient.request("/fail")).rejects.toThrow("Bad request");
	});
});
