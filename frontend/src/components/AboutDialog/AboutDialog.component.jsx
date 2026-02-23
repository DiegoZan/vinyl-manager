import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack, Link } from "@mui/material";

export default function AboutDialog({ open, onClose }) {
	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
			<DialogTitle>About</DialogTitle>
			<DialogContent dividers>
				<Stack spacing={1}>
					<Typography variant="body1" fontWeight={600}>
						Vinyl Collection Manager
					</Typography>
					<Typography variant="body2">
						Personal project to track a vinyl record collection with Discogs integration.
					</Typography>
					<Typography variant="body2" sx={{ mt: 1 }}>
						<strong>Author:</strong> Diego Zanandrea
					</Typography>
					<Typography variant="body2" sx={{ mt: 1 }}>
						<strong>TFM:</strong> Máster en Desarrollo con IA - BIG
					</Typography>
					<Typography variant="body2">
						<strong>Tech:</strong> React + MUI + Node/Express + SQLite
					</Typography>
					<Typography variant="body2">
						<strong>Contact:</strong> <Link href="mailto:diego.zanandrea@qlogik.us">diego.zanandrea@qlogik.us</Link>
					</Typography>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}
