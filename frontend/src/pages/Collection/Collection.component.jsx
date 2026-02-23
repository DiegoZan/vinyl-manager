import { Alert, Box, CircularProgress, Grid, MenuItem, Stack, TextField, Typography, Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import ReleaseCard from "../ReleaseCard";
import ImportFromDiscogsDialogView from "./ImportFromDiscogsDialog.component.jsx";

export default function CollectionView({
	q,
	status,
	onQChange,
	onStatusChange,
	items,
	loading,
	error,
	onOpenImport,
	importDialog,
}) {
	return (
		<Stack spacing={2}>
			<Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
				<Typography variant="h5">My Collection</Typography>
				<Button variant="contained" startIcon={<Add />} onClick={onOpenImport}>
					Import from Discogs
				</Button>
			</Stack>

			<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
				<TextField
					label="Search"
					value={q}
					onChange={(e) => onQChange(e.target.value)}
					placeholder="Artist, title, year, track, catno, barcode..."
					fullWidth
				/>

				<TextField
					label="Status"
					value={status}
					onChange={(e) => onStatusChange(e.target.value)}
					select
					sx={{ minWidth: 220 }}
				>
					<MenuItem value="">All</MenuItem>
					<MenuItem value="active">Active</MenuItem>
					<MenuItem value="sold">Sold</MenuItem>
					<MenuItem value="lost">Lost</MenuItem>
					<MenuItem value="broken">Broken</MenuItem>
					<MenuItem value="traded">Traded</MenuItem>
				</TextField>
				<ImportFromDiscogsDialogView {...importDialog} />
			</Stack>

			{loading && (
				<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
					<CircularProgress />
				</Box>
			)}

			{error && <Alert severity="error">{error}</Alert>}

			{!loading && !error && items.length === 0 && <Alert severity="info">No items found.</Alert>}

			<Grid container spacing={2}>
				{items.map((item) => (
					<Grid key={item.collectionItemId} item xs={12} sm={6} md={4} lg={3}>
						<ReleaseCard item={item} />
					</Grid>
				))}
			</Grid>
		</Stack>
	);
}
