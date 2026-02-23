import { useState } from "react";
import { Container, AppBar, Toolbar, Typography, IconButton, Stack } from "@mui/material";
import { Info } from "@mui/icons-material";
import AppRoutes from "./routes/AppRoutes";
import AboutDialog from "./components/AboutDialog/AboutDialog.component";

export default function App() {
	const [aboutDialogOpen, setAboutDialogOpen] = useState(false);

	return (
		<>
			<AppBar position="sticky">
				<Toolbar>
					<Typography variant="h6">Vinyl Collection Manager</Typography>
					<Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
						<IconButton color="inherit" onClick={() => setAboutDialogOpen(true)} aria-label="About">
							<Info />
						</IconButton>
					</Stack>
				</Toolbar>
			</AppBar>

			<Container maxWidth="lg" sx={{ py: 3 }}>
				<AppRoutes />
			</Container>

			<AboutDialog open={aboutDialogOpen} onClose={() => setAboutDialogOpen(false)} />
		</>
	);
}
