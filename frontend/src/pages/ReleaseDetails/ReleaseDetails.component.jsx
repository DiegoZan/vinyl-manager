import {
	Alert,
	Box,
	Card,
	CardContent,
	CardMedia,
	CircularProgress,
	Divider,
	List,
	ListItem,
	ListItemText,
	Stack,
	Typography,
} from "@mui/material";

export default function ReleaseDetailsView({ loading, error, data }) {
	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) return <Alert severity="error">{error}</Alert>;
	if (!data) return null;

	const { release, artists, labels, tracks, barcodes, collectionItems } = data;
	const cover = release.coverImageUrl || "https://via.placeholder.com/600x600?text=No+Cover";

	const artistText = artists.length ? artists.map((a) => a.name).join(", ") : "Unknown artist";

	return (
		<Stack spacing={2}>
			<Typography variant="h5">{release.title}</Typography>
			<Typography variant="body1" color="text.secondary">
				{artistText}
				{release.year ? ` • ${release.year}` : ""}
				{release.country ? ` • ${release.country}` : ""}
			</Typography>

			<Card>
				<Stack direction={{ xs: "column", md: "row" }}>
					<CardMedia component="img" sx={{ width: { md: 320 } }} image={cover} alt={`${release.title} cover`} />
					<CardContent sx={{ flex: 1 }}>
						<Stack spacing={1}>
							{release.format && (
								<Typography variant="body2">
									<strong>Format:</strong> {release.format}
								</Typography>
							)}

							{labels.length > 0 && (
								<Typography variant="body2">
									<strong>Labels:</strong> {labels.map((l) => (l.catno ? `${l.name} (${l.catno})` : l.name)).join(", ")}
								</Typography>
							)}

							{barcodes.length > 0 && (
								<Typography variant="body2">
									<strong>Barcodes:</strong> {barcodes.join(", ")}
								</Typography>
							)}

							{release.genres?.length > 0 && (
								<Typography variant="body2">
									<strong>Genres:</strong> {release.genres.join(", ")}
								</Typography>
							)}

							{release.styles?.length > 0 && (
								<Typography variant="body2">
									<strong>Styles:</strong> {release.styles.join(", ")}
								</Typography>
							)}

							<Divider sx={{ my: 1 }} />

							<Typography variant="subtitle1">Collection items</Typography>
							{collectionItems.length === 0 ? (
								<Typography variant="body2" color="text.secondary">
									No copies registered.
								</Typography>
							) : (
								<List dense>
									{collectionItems.map((ci) => (
										<ListItem key={ci.id} disablePadding>
											<ListItemText
												primary={`#${ci.id} • ${ci.status}`}
												secondary={[
													ci.location ? `Location: ${ci.location}` : null,
													ci.mediaCondition ? `Media: ${ci.mediaCondition}` : null,
													ci.sleeveCondition ? `Sleeve: ${ci.sleeveCondition}` : null,
												]
													.filter(Boolean)
													.join(" • ")}
											/>
										</ListItem>
									))}
								</List>
							)}
						</Stack>
					</CardContent>
				</Stack>
			</Card>

			<Card>
				<CardContent>
					<Typography variant="subtitle1" gutterBottom>
						Tracklist
					</Typography>

					{tracks.length === 0 ? (
						<Typography variant="body2" color="text.secondary">
							No tracklist available.
						</Typography>
					) : (
						<List dense>
							{tracks.map((t) => {
								const primary = (t.position ? `${t.position} ` : "") + t.title;
								return (
									<ListItem key={t.id} disablePadding>
										<ListItemText
											primary={primary}
											secondary={t.duration || undefined}
										/>
									</ListItem>
								);
							})}
						</List>
					)}
				</CardContent>
			</Card>
		</Stack>
	);
}
