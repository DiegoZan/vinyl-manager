import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stack,
	TextField,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
} from "@mui/material";

export default function EditCollectionItemDialogView({ open, onClose, onSave, saving, error, values, onChange }) {
	const goldmineOptions = ["M", "NM", "VG+", "VG", "G+", "G", "F", "P"];

	return (
		<Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
			<DialogTitle>Edit collection item</DialogTitle>

			<DialogContent dividers>
				<Stack spacing={2} sx={{ mt: 1 }}>
					{error && <Alert severity="error">{error}</Alert>}

					<TextField
						label="Location"
						value={values.location ?? ""}
						onChange={(e) => onChange({ location: e.target.value })}
						fullWidth
					/>

					<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
						<FormControl fullWidth>
							<InputLabel id="media-condition-label">Media condition</InputLabel>
							<Select
								labelId="media-condition-label"
								label="Media condition"
								value={values.mediaCondition ?? ""}
								onChange={(e) => onChange({ mediaCondition: e.target.value })}
							>
								<MenuItem value="">(not set)</MenuItem>
								{goldmineOptions.map((g) => (
									<MenuItem key={g} value={g}>
										{g}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControl fullWidth>
							<InputLabel id="sleeve-condition-label">Sleeve condition</InputLabel>
							<Select
								labelId="sleeve-condition-label"
								label="Sleeve condition"
								value={values.sleeveCondition ?? ""}
								onChange={(e) => onChange({ sleeveCondition: e.target.value })}
							>
								<MenuItem value="">(not set)</MenuItem>
								{goldmineOptions.map((g) => (
									<MenuItem key={g} value={g}>
										{g}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Stack>

					<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
						<TextField
							label="Purchase date (YYYY-MM-DD)"
							value={values.purchaseDate ?? ""}
							onChange={(e) => onChange({ purchaseDate: e.target.value })}
							placeholder="YYYY-MM-DD"
							fullWidth
						/>
						<TextField
							label="Currency"
							value={values.currency ?? ""}
							onChange={(e) => onChange({ currency: e.target.value })}
							placeholder="EUR"
							slotProps={{ htmlInput: { maxLength: 3 } }}
							fullWidth
						/>
					</Stack>

					<TextField
						label="Purchase price (cents)"
						value={values.purchasePriceCents ?? ""}
						onChange={(e) => onChange({ purchasePriceCents: e.target.value })}
						placeholder="e.g., 1999"
						inputMode="numeric"
						fullWidth
					/>

					<TextField
						label="Notes"
						value={values.notes ?? ""}
						onChange={(e) => onChange({ notes: e.target.value })}
						fullWidth
						multiline
						minRows={3}
					/>
				</Stack>
			</DialogContent>

			<DialogActions>
				<Button onClick={onClose} disabled={saving}>
					Cancel
				</Button>
				<Button variant="contained" onClick={onSave} disabled={saving}>
					Save
				</Button>
			</DialogActions>
		</Dialog>
	);
}
