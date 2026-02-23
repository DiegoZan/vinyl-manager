import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReleaseDetails } from "../../api/releasesApi";
import ReleaseDetailsView from "./ReleaseDetails.component";

export default function ReleaseDetailsContainer() {
	const { id } = useParams();
	const releaseId = Number(id);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [data, setData] = useState(null);

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

	return <ReleaseDetailsView loading={loading} error={error} data={data} />;
}
