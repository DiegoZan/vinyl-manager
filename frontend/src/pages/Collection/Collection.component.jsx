import { Alert, Box, CircularProgress, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import ReleaseCard from "../ReleaseCard";

export default function CollectionView({ q, status, onQChange, onStatusChange, items, loading, error }) {
	return (
		<Stack spacing={2}>
			<Typography variant="h5">My Collection</Typography>

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
