import { describe, it, expect } from "vitest";
import { mapDiscogsReleaseToEntities } from "../src/mappers/discogsRelease.mapper.js";

describe("mapDiscogsReleaseToEntities", () => {
	it("maps minimal Discogs release fields", () => {
		const input = {
			id: 123,
			title: "Kind Of Blue",
			year: 1959,
			country: "US",
			formats: [{ name: "Vinyl", qty: "1", descriptions: ["LP", "Album"] }],
			genres: ["Jazz"],
			styles: ["Modal"],
			labels: [{ name: "Columbia", catno: "CL 1355" }],
			artists: [{ name: "Miles Davis", role: "Main" }],
			tracklist: [
				{ type_: "track", position: "A1", title: "So What", duration: "9:22" },
				{ type_: "track", position: "A2", title: "Freddie Freeloader", duration: "9:46" },
			],
			identifiers: [{ type: "Barcode", value: "1234567890123" }],
			resource_url: "https://api.discogs.com/releases/123",
			images: [{ type: "primary", uri: "https://img.example/cover.jpg" }],
		};

		const mapped = mapDiscogsReleaseToEntities(input);

		expect(mapped.release.discogsReleaseId).toBe(123);
		expect(mapped.release.title).toBe("Kind Of Blue");
		expect(mapped.release.year).toBe(1959);
		expect(mapped.release.format).toContain("Vinyl");
		expect(mapped.release.coverImageUrl).toBe("https://img.example/cover.jpg");

		expect(mapped.artists.length).toBe(1);
		expect(mapped.artists[0].name).toBe("Miles Davis");

		expect(mapped.labels.length).toBe(1);
		expect(mapped.labels[0].name).toBe("Columbia");
		expect(mapped.labels[0].catno).toBe("CL 1355");

		expect(mapped.tracks.length).toBe(2);
		expect(mapped.tracks[0].title).toBe("So What");

		expect(mapped.barcodes).toEqual(["1234567890123"]);
	});

	it("deduplicates barcodes and ignores non-barcode identifiers", () => {
		const input = {
			id: 1,
			title: "Test",
			identifiers: [
				{ type: "Barcode", value: "111" },
				{ type: "Barcode", value: "111" },
				{ type: "Matrix / Runout", value: "XYZ" },
			],
		};

		const mapped = mapDiscogsReleaseToEntities(input);
		expect(mapped.barcodes).toEqual(["111"]);
	});

	it("skips non-track entries in tracklist", () => {
		const input = {
			id: 2,
			title: "Test",
			tracklist: [
				{ type_: "heading", title: "Side A" },
				{ type_: "track", position: "A1", title: "Song A" },
			],
		};

		const mapped = mapDiscogsReleaseToEntities(input);
		expect(mapped.tracks.length).toBe(1);
		expect(mapped.tracks[0].title).toBe("Song A");
	});

	it("throws if id or title is missing", () => {
		expect(() => mapDiscogsReleaseToEntities({ title: "X" })).toThrow();
		expect(() => mapDiscogsReleaseToEntities({ id: 10 })).toThrow();
	});

	it("falls back to thumb if no images are present", () => {
		const input = { id: 3, title: "Test", thumb: "https://img.example/thumb.jpg" };
		const mapped = mapDiscogsReleaseToEntities(input);
		expect(mapped.release.coverImageUrl).toBe("https://img.example/thumb.jpg");
	});
});
