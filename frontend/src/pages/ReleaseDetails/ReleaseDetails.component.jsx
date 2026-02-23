import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	CardMedia,
	CircularProgress,
	Divider,
	FormControl,
	IconButton,
	InputLabel,
	LinearProgress,
	List,
	ListItem,
	ListItemText,
	MenuItem,
	Select,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ArrowBack, Edit } from "@mui/icons-material";
import EditCollectionItemDialogView from "./EditCollectionItemDialog.component.jsx";

export default function ReleaseDetailsView({
	loading,
	error,
	data,
	savingByItemId = {},
	saveErrorByItemId = {},
	onChangeCollectionItemStatus,
	onEditCollectionItem,
	editDialog,
}) {
	const navigate = useNavigate();

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
	const cover = release.coverImageUrl || "https://placehold.co/600/orange/green?text=No+Cover";

	const artistText = artists.length ? artists.map((a) => a.name).join(", ") : "Unknown artist";

	return (
		<Stack spacing={2}>
			<Box>
				<Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} variant="outlined">
					Back to collection
				</Button>
			</Box>
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
									{collectionItems.map((ci) => {
										const saving = Boolean(savingByItemId[ci.id]);
										const saveError = saveErrorByItemId[ci.id];

										return (
											<ListItem key={ci.id} disablePadding sx={{ py: 1 }}>
												<Stack
													direction={{ xs: "column", sm: "row" }}
													spacing={2}
													sx={{ width: "100%" }}
													alignItems={{ sm: "center" }}
												>
													<Box sx={{ flex: 1, minWidth: 0 }}>
														<Typography variant="body2" fontWeight={600}>
															Copy #{ci.id}
														</Typography>

														<Typography variant="body2" color="text.secondary" noWrap>
															{[
																ci.location ? `Location: ${ci.location}` : null,
																ci.mediaCondition ? `Media: ${ci.mediaCondition}` : null,
																ci.sleeveCondition ? `Sleeve: ${ci.sleeveCondition}` : null,
															]
																.filter(Boolean)
																.join(" • ") || "—"}
														</Typography>

														{saveError && (
															<Typography variant="caption" color="error">
																{saveError}
															</Typography>
														)}

														{saving && <LinearProgress sx={{ mt: 1 }} />}
													</Box>

													<FormControl size="small" sx={{ minWidth: 170 }} disabled={saving}>
														<InputLabel id={`status-label-${ci.id}`}>Status</InputLabel>
														<Select
															labelId={`status-label-${ci.id}`}
															value={ci.status}
															label="Status"
															onChange={(e) => onChangeCollectionItemStatus?.(ci.id, e.target.value)}
														>
															<MenuItem value="active">active</MenuItem>
															<MenuItem value="sold">sold</MenuItem>
															<MenuItem value="lost">lost</MenuItem>
															<MenuItem value="broken">broken</MenuItem>
															<MenuItem value="traded">traded</MenuItem>
														</Select>
													</FormControl>
													<Tooltip title="Edit">
														<span>
															<IconButton
																aria-label={`Edit collection item ${ci.id}`}
																onClick={() => onEditCollectionItem?.(ci)}
																disabled={saving}
																size="small"
															>
																<Edit />
															</IconButton>
														</span>
													</Tooltip>
												</Stack>
											</ListItem>
										);
									})}
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
										<ListItemText primary={primary} secondary={t.duration || undefined} />
									</ListItem>
								);
							})}
						</List>
					)}
				</CardContent>
			</Card>
			{editDialog?.open && <EditCollectionItemDialogView {...editDialog} />}
		</Stack>
	);
}
