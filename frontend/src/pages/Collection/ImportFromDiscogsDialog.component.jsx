import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	List,
	ListItemButton,
	ListItemText,
	Stack,
	Tab,
	Tabs,
	TextField,
	Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function DiscogsResultRow({ r, onSelect }) {
	const title = r?.title || "Untitled";
	const year = r?.year ? String(r.year) : "—";
	const country = r?.country ? String(r.country) : "—";
	const label = r?.label?.[0] ? String(r.label[0]) : null;
	const catno = r?.catno?.[0] ? String(r.catno[0]) : null;

	const secondary = [
		year === "—" ? null : year,
		country === "—" ? null : country,
		label ? (catno ? `${label} (${catno})` : label) : null,
	]
		.filter(Boolean)
		.join(" • ");

	return (
		<ListItemButton onClick={() => onSelect(r)}>
			<Box
				component="img"
				src={r?.thumb || "https://via.placeholder.com/80x80?text=No+Cover"}
				alt=""
				sx={{
					width: 64,
					height: 64,
					borderRadius: 1,
					objectFit: "cover",
					mr: 2,
					flexShrink: 0,
				}}
			/>
			<ListItemText primary={title} secondary={secondary || undefined} slotProps={{ primary: { noWrap: true } }} />
			<Typography variant="body2" color="text.secondary" sx={{ ml: 2, flexShrink: 0 }}>
				{r?.type || ""}
			</Typography>
		</ListItemButton>
	);
}

export default function ImportFromDiscogsDialogView({
	open,
	onClose,

	mode,
	onModeChange,

	barcode,
	onBarcodeChange,

	artist,
	onArtistChange,

	title,
	onTitleChange,

	catno,
	onCatnoChange,

	searching,
	searchError,
	results,
	onSearch,

	importing,
	importError,
	onSelectResult,
}) {
	const canSearch =
		(mode === "barcode" && barcode.trim().length > 0) ||
		(mode === "artistTitle" && (artist.trim().length > 0 || title.trim().length > 0)) ||
		(mode === "catno" && catno.trim().length > 0);

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
			<DialogTitle sx={{ pr: 6 }}>
				Import from Discogs
				<IconButton onClick={onClose} aria-label="close" sx={{ position: "absolute", right: 8, top: 8 }}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<DialogContent dividers>
				<Stack spacing={2}>
					<Tabs value={mode} onChange={(_, v) => onModeChange(v)} variant="scrollable" scrollButtons="auto">
						<Tab value="barcode" label="Barcode" />
						<Tab value="artistTitle" label="Artist + Title" />
						<Tab value="catno" label="Catalog No." />
					</Tabs>

					{mode === "barcode" && (
						<TextField
							label="Barcode"
							value={barcode}
							onChange={(e) => onBarcodeChange(e.target.value)}
							placeholder="e.g. 602557521116"
							fullWidth
						/>
					)}

					{mode === "artistTitle" && (
						<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
							<TextField
								label="Artist"
								value={artist}
								onChange={(e) => onArtistChange(e.target.value)}
								placeholder="e.g. Nirvana"
								fullWidth
							/>
							<TextField
								label="Title"
								value={title}
								onChange={(e) => onTitleChange(e.target.value)}
								placeholder="e.g. Nevermind"
								fullWidth
							/>
						</Stack>
					)}

					{mode === "catno" && (
						<TextField
							label="Catalog number (catno)"
							value={catno}
							onChange={(e) => onCatnoChange(e.target.value)}
							placeholder="e.g. CL 1355"
							fullWidth
						/>
					)}

					<Stack direction="row" spacing={2} alignItems="center">
						<Button variant="contained" onClick={onSearch} disabled={!canSearch || searching || importing}>
							Search
						</Button>

						{(searching || importing) && <CircularProgress size={22} />}

						{importing && (
							<Typography variant="body2" color="text.secondary">
								Importing selected release…
							</Typography>
						)}
					</Stack>

					{searchError && <Alert severity="error">{searchError}</Alert>}
					{importError && <Alert severity="error">{importError}</Alert>}

					<Divider />

					{results.length === 0 ? (
						<Typography variant="body2" color="text.secondary">
							{searching ? "Searching…" : "No results yet. Run a search to see matches."}
						</Typography>
					) : (
						<>
							<Typography variant="subtitle2" color="text.secondary">
								Results ({results.length})
							</Typography>
							<List dense disablePadding sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
								{results.map((r) => (
									<DiscogsResultRow key={`${r.type}-${r.id}`} r={r} onSelect={onSelectResult} />
								))}
							</List>

							<Typography variant="caption" color="text.secondary">
								Tip: results may include "master" and "release". Prefer selecting a <strong>release</strong> when
								available.
							</Typography>
						</>
					)}
				</Stack>
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose} disabled={importing}>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
}
