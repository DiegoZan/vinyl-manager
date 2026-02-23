import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReleaseDetails, updateCollectionItemStatus, updateCollectionItem } from "../../api/releasesApi";
import ReleaseDetailsView from "./ReleaseDetails.component";

export default function ReleaseDetailsContainer() {
	const { id } = useParams();
	const releaseId = Number(id);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [data, setData] = useState(null);
	const [editOpen, setEditOpen] = useState(false);
	const [editItemId, setEditItemId] = useState(null);
	const [editValues, setEditValues] = useState({});
	const [editSaving, setEditSaving] = useState(false);
	const [editError, setEditError] = useState(null);

	// per-item save state
	const [savingByItemId, setSavingByItemId] = useState(() => ({}));
	const [saveErrorByItemId, setSaveErrorByItemId] = useState(() => ({}));

	const openEditDialog = useCallback((collectionItem) => {
		setEditError(null);
		setEditItemId(collectionItem.id);
		setEditValues({
			location: collectionItem.location ?? "",
			mediaCondition: collectionItem.mediaCondition ?? "",
			sleeveCondition: collectionItem.sleeveCondition ?? "",
			purchaseDate: collectionItem.purchaseDate ?? "",
			purchasePriceCents: collectionItem.purchasePriceCents ?? "",
			currency: collectionItem.currency ?? "",
			notes: collectionItem.notes ?? "",
		});
		setEditOpen(true);
	}, []);

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

	const closeEditDialog = useCallback(() => {
		if (editSaving) return;
		setEditOpen(false);
	}, [editSaving]);

	const changeEditValues = useCallback((patch) => {
		setEditValues((prev) => ({ ...prev, ...patch }));
	}, []);

	const saveEditDialog = useCallback(async () => {
		if (!editItemId) return;

		setEditSaving(true);
		setEditError(null);

		try {
			// Send only fields we support (and keep strings)
			const payload = {
				location: editValues.location,
				mediaCondition: editValues.mediaCondition,
				sleeveCondition: editValues.sleeveCondition,
				purchaseDate: editValues.purchaseDate,
				purchasePriceCents: editValues.purchasePriceCents === "" ? null : Number(editValues.purchasePriceCents),
				currency: editValues.currency,
				notes: editValues.notes,
			};

			await updateCollectionItem(editItemId, payload);
			await reload();
			setEditOpen(false);
		} catch (err) {
			setEditError(err.message || "Failed to save changes.");
		} finally {
			setEditSaving(false);
		}
	}, [editItemId, editValues, reload]);

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
			onEditCollectionItem={openEditDialog}
			editDialog={{
				open: editOpen,
				onClose: closeEditDialog,
				onSave: saveEditDialog,
				saving: editSaving,
				error: editError,
				values: editValues,
				onChange: changeEditValues,
			}}
		/>
	);
}
