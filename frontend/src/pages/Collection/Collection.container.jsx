import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCollectionItems, importFromDiscogs } from "../../api/releasesApi";
import { discogsSearch } from "../../api/discogsApi";
import CollectionView from "./Collection.component";

export default function CollectionContainer() {
	const navigate = useNavigate();

	const [q, setQ] = useState("");
	const [status, setStatus] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [items, setItems] = useState([]);

	// Import dialog state
	const [importOpen, setImportOpen] = useState(false);
	const [mode, setMode] = useState("barcode"); // barcode | artistTitle | catno
	const [barcode, setBarcode] = useState("");
	const [artist, setArtist] = useState("");
	const [title, setTitle] = useState("");
	const [catno, setCatno] = useState("");

	const [searching, setSearching] = useState(false);
	const [searchError, setSearchError] = useState(null);
	const [results, setResults] = useState([]);

	const [importing, setImporting] = useState(false);
	const [importError, setImportError] = useState(null);

	const filters = useMemo(() => ({ q, status }), [q, status]);

	const loadCollection = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await getCollectionItems({
				q: filters.q,
				status: filters.status,
				limit: 50,
				offset: 0,
			});
			setItems(data.items || []);
		} catch (err) {
			setError(err.message || "Failed to load collection.");
		} finally {
			setLoading(false);
		}
	}, [filters]);

	useEffect(() => {
		let cancelled = false;

		async function run() {
			setLoading(true);
			setError(null);
			try {
				const data = await getCollectionItems({ q: filters.q, status: filters.status, limit: 50, offset: 0 });
				if (!cancelled) setItems(data.items || []);
			} catch (err) {
				if (!cancelled) setError(err.message || "Failed to load collection.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		run();
		return () => {
			cancelled = true;
		};
	}, [filters]);

	const openImport = () => {
		setImportError(null);
		setSearchError(null);
		setResults([]);
		setImportOpen(true);
	};

	const closeImport = () => {
		if (importing) return;
		setImportOpen(false);
	};

	const handleSearch = async () => {
		setSearchError(null);
		setImportError(null);
		setResults([]);

		const params = { perPage: 15, page: 1, type: "release" };

		if (mode === "barcode") params.barcode = barcode;
		if (mode === "artistTitle") {
			params.artist = artist;
			params.title = title;
		}
		if (mode === "catno") params.catno = catno;

		setSearching(true);
		try {
			const data = await discogsSearch(params);
			setResults(data.results || []);
		} catch (err) {
			setSearchError(err.message || "Discogs search failed.");
		} finally {
			setSearching(false);
		}
	};

	const handleSelectResult = async (r) => {
		// We can only import a release id via our backend endpoint
		if (r?.type !== "release") {
			setImportError('Please select a result of type "release".');
			return;
		}

		setImporting(true);
		setImportError(null);

		try {
			const res = await importFromDiscogs(r.id);

			// Refresh collection after import
			await loadCollection();

			setImportOpen(false);

			// Navigate to details of the imported release
			if (res?.releaseId) {
				navigate(`/releases/${res.releaseId}`);
			}
		} catch (err) {
			setImportError(err.message || "Import failed.");
		} finally {
			setImporting(false);
		}
	};

	return (
		<CollectionView
			q={q}
			status={status}
			onQChange={setQ}
			onStatusChange={setStatus}
			items={items}
			loading={loading}
			error={error}
			onOpenImport={openImport}
			importDialog={{
				open: importOpen,
				onClose: closeImport,
				mode,
				onModeChange: (v) => setMode(v),
				barcode,
				onBarcodeChange: setBarcode,
				artist,
				onArtistChange: setArtist,
				title,
				onTitleChange: setTitle,
				catno,
				onCatnoChange: setCatno,
				searching,
				searchError,
				results,
				onSearch: handleSearch,
				importing,
				importError,
				onSelectResult: handleSelectResult,
			}}
		/>
	);
}
