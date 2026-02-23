import { useState, useMemo } from "react";
import {
	Container,
	AppBar,
	Toolbar,
	Typography,
	IconButton,
	Stack,
	ThemeProvider,
	CssBaseline,
	createTheme,
} from "@mui/material";
import { LightMode as LightModeIcon, DarkMode as DarkModeIcon } from "@mui/icons-material";
import { Info } from "@mui/icons-material";
import AppRoutes from "./routes/AppRoutes";
import AboutDialog from "./components/AboutDialog/AboutDialog.component";

export default function App() {
	const [aboutDialogOpen, setAboutDialogOpen] = useState(false);
	const [mode, setMode] = useState(() => localStorage.getItem("themeMode") || "light");

	const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

	const toggleMode = () => {
		setMode((prev) => {
			const next = prev === "light" ? "dark" : "light";
			localStorage.setItem("themeMode", next);
			return next;
		});
	};

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<AppBar position="sticky">
				<Toolbar>
					<Typography variant="h6">Vinyl Collection Manager</Typography>
					<Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
						<IconButton color="inherit" onClick={toggleMode} aria-label="Toggle dark mode">
							{mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
						</IconButton>
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
		</ThemeProvider>
	);
}
