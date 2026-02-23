import { useEffect, useMemo, useState } from "react";
import { getCollectionItems } from "../../api/releasesApi";
import CollectionView from "./Collection.component";

export default function CollectionContainer() {
	const [q, setQ] = useState("");
	const [status, setStatus] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [items, setItems] = useState([]);

	const filters = useMemo(() => ({ q, status }), [q, status]);

	useEffect(() => {
		let cancelled = false;

		async function load() {
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

		load();
		return () => {
			cancelled = true;
		};
	}, [filters]);

	return (
		<CollectionView
			q={q}
			status={status}
			onQChange={setQ}
			onStatusChange={setStatus}
			items={items}
			loading={loading}
			error={error}
		/>
	);
}
