// backend/src/mappers/discogsRelease.mapper.js

function normalizeString(value) {
	const s = String(value ?? "").trim();
	return s.length ? s : null;
}

function normalizeYear(value) {
	const n = Number(value);
	if (!Number.isInteger(n) || n < 1800 || n > 3000) return null;
	return n;
}

function pickCoverImageUrl(discogsRelease) {
	// Prefer primary image uri; fallback to thumb or first image.
	const images = Array.isArray(discogsRelease?.images) ? discogsRelease.images : [];

	const primary = images.find((img) => String(img?.type).toLowerCase() === "primary");
	const uri = primary?.uri || primary?.resource_url;
	if (uri) return String(uri);

	const thumb = discogsRelease?.thumb;
	if (thumb) return String(thumb);

	const first = images[0]?.uri || images[0]?.resource_url;
	return first ? String(first) : null;
}

function toFormatString(discogsRelease) {
	// Discogs release formats is an array, each item like:
	// { name: "Vinyl", qty: "1", descriptions: ["LP", "Album"] }
	const formats = Array.isArray(discogsRelease?.formats) ? discogsRelease.formats : [];
	if (!formats.length) return null;

	// Keep it simple and readable for UI
	// Example: "Vinyl (LP, Album) x1; CD x1"
	const parts = formats.map((f) => {
		const name = normalizeString(f?.name) ?? "Unknown";
		const qty = normalizeString(f?.qty);
		const desc = Array.isArray(f?.descriptions) ? f.descriptions.filter(Boolean) : [];
		const descPart = desc.length ? ` (${desc.join(", ")})` : "";
		const qtyPart = qty ? ` x${qty}` : "";
		return `${name}${descPart}${qtyPart}`;
	});

	return parts.join("; ");
}

function extractArtists(discogsRelease) {
	const artists = Array.isArray(discogsRelease?.artists) ? discogsRelease.artists : [];
	// Discogs artists items have { name, role, join, anv, id, ... }
	// We store name + role + ordering position.
	return artists
		.map((a, index) => ({
			name: normalizeString(a?.name),
			role: normalizeString(a?.role),
			position: index,
		}))
		.filter((a) => a.name);
}

function extractLabels(discogsRelease) {
	const labels = Array.isArray(discogsRelease?.labels) ? discogsRelease.labels : [];
	// Discogs labels: { name, catno, id, entity_type, ... }
	// We store label name + catno + position.
	return labels
		.map((l, index) => ({
			name: normalizeString(l?.name),
			catno: normalizeString(l?.catno) ?? "", // NOTE: schema expects NOT NULL, default ''
			position: index,
		}))
		.filter((l) => l.name);
}

function extractTracks(discogsRelease) {
	const tracklist = Array.isArray(discogsRelease?.tracklist) ? discogsRelease.tracklist : [];
	// Track items can include types like "heading". We'll keep only actual tracks with titles.
	let trackIndex = 0;

	return tracklist
		.map((t) => {
			const title = normalizeString(t?.title);
			const type = normalizeString(t?.type_);
			if (!title) return null;
			if (type && type.toLowerCase() !== "track") {
				// Skip headings/index entries. If you want them later, store separately.
				return null;
			}

			const position = normalizeString(t?.position);
			const duration = normalizeString(t?.duration);

			trackIndex += 1;

			return {
				position,
				title,
				duration,
				trackIndex,
			};
		})
		.filter(Boolean);
}

function extractBarcodes(discogsRelease) {
	const identifiers = Array.isArray(discogsRelease?.identifiers) ? discogsRelease.identifiers : [];
	// Discogs identifiers: { type: "Barcode", value: "..." }
	const values = identifiers
		.filter((i) => String(i?.type ?? "").toLowerCase() === "barcode")
		.map((i) => normalizeString(i?.value))
		.filter(Boolean);

	// Deduplicate
	return Array.from(new Set(values));
}

/**
 * Pure mapper: Discogs release JSON -> normalized entities for our DB.
 * This function MUST NOT access the database.
 */
export function mapDiscogsReleaseToEntities(discogsRelease) {
	const discogsReleaseId = Number(discogsRelease?.id);
	if (!Number.isInteger(discogsReleaseId) || discogsReleaseId <= 0) {
		throw new Error("Invalid Discogs release: missing or invalid 'id'.");
	}

	const title = normalizeString(discogsRelease?.title);
	if (!title) {
		throw new Error("Invalid Discogs release: missing 'title'.");
	}

	const discogsMasterId = discogsRelease?.master_id == null ? null : Number(discogsRelease.master_id);
	const masterId = Number.isInteger(discogsMasterId) && discogsMasterId > 0 ? discogsMasterId : null;

	const year = normalizeYear(discogsRelease?.year);
	const country = normalizeString(discogsRelease?.country);
	const format = toFormatString(discogsRelease);

	const genres = Array.isArray(discogsRelease?.genres) ? discogsRelease.genres.filter(Boolean) : [];
	const styles = Array.isArray(discogsRelease?.styles) ? discogsRelease.styles.filter(Boolean) : [];

	const artists = extractArtists(discogsRelease);
	const labels = extractLabels(discogsRelease);
	const tracks = extractTracks(discogsRelease);
	const barcodes = extractBarcodes(discogsRelease);

	// Convenience fields
	const labelMain = labels.length ? labels[0].name : null;
	const catnoMain = labels.length ? labels[0].catno || null : null;

	const coverImageUrl = pickCoverImageUrl(discogsRelease);
	const resourceUrl = normalizeString(discogsRelease?.resource_url) ?? null;

	return {
		release: {
			discogsReleaseId,
			discogsMasterId: masterId,
			title,
			year,
			country,
			format,
			genres: genres.length ? JSON.stringify(genres) : null,
			styles: styles.length ? JSON.stringify(styles) : null,
			labelMain,
			catnoMain,
			coverImageUrl,
			resourceUrl,
		},
		artists, // [{ name, role, position }]
		labels, // [{ name, catno, position }]
		tracks, // [{ position, title, duration, trackIndex }]
		barcodes, // ["..."]
	};
}
