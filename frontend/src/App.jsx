import { Container, AppBar, Toolbar, Typography } from "@mui/material";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
	return (
		<>
			<AppBar position="sticky">
				<Toolbar>
					<Typography variant="h6">Vinyl Collection Manager</Typography>
				</Toolbar>
			</AppBar>

			<Container maxWidth="lg" sx={{ py: 3 }}>
				<AppRoutes />
			</Container>
		</>
	);
}
