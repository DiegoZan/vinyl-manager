import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReleaseDetails, updateCollectionItemStatus } from "../../api/releasesApi";
import ReleaseDetailsView from "./ReleaseDetails.component";

export default function ReleaseDetailsContainer() {
	const { id } = useParams();
	const releaseId = Number(id);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [data, setData] = useState(null);

	// per-item save state
	const [savingByItemId, setSavingByItemId] = useState(() => ({}));
	const [saveErrorByItemId, setSaveErrorByItemId] = useState(() => ({}));

	const reload = useCallback(async () => {
		if (!Number.isInteger(releaseId) || releaseId <= 0) {
			setError("Invalid release id.");
			return;
		}

		setLoading(true);
		setError(null);
		try {
			const res = await getReleaseDetails(releaseId);
			setData(res);
		} catch (err) {
			setError(err.message || "Failed to load release.");
		} finally {
			setLoading(false);
		}
	}, [releaseId]);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			if (!Number.isInteger(releaseId) || releaseId <= 0) {
				setError("Invalid release id.");
				return;
			}

			setLoading(true);
			setError(null);
			try {
				const res = await getReleaseDetails(releaseId);
				if (!cancelled) setData(res);
			} catch (err) {
				if (!cancelled) setError(err.message || "Failed to load release.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		load();
		return () => {
			cancelled = true;
		};
	}, [releaseId]);

	const handleStatusChange = useCallback(
		async (collectionItemId, nextStatus) => {
			setSaveErrorByItemId((prev) => ({ ...prev, [collectionItemId]: null }));
			setSavingByItemId((prev) => ({ ...prev, [collectionItemId]: true }));

			try {
				await updateCollectionItemStatus(collectionItemId, nextStatus);
				await reload();
			} catch (err) {
				setSaveErrorByItemId((prev) => ({
					...prev,
					[collectionItemId]: err.message || "Failed to update status.",
				}));
			} finally {
				setSavingByItemId((prev) => ({ ...prev, [collectionItemId]: false }));
			}
		},
		[reload],
	);

	return (
		<ReleaseDetailsView
			loading={loading}
			error={error}
			data={data}
			savingByItemId={savingByItemId}
			saveErrorByItemId={saveErrorByItemId}
			onChangeCollectionItemStatus={handleStatusChange}
		/>
	);
}
