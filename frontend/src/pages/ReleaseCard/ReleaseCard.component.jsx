import { Card, CardActionArea, CardContent, CardMedia, Chip, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ReleaseCard({ item }) {
	const navigate = useNavigate();

	const cover = item.coverImageUrl || "https://via.placeholder.com/600x600?text=No+Cover";

	return (
		<Card>
			<CardActionArea onClick={() => navigate(`/releases/${item.releaseId}`)}>
				<CardMedia component="img" height="220" image={cover} alt={`${item.title} cover`} />
				<CardContent>
					<Stack spacing={1}>
						<Typography variant="subtitle1" fontWeight={600} noWrap title={item.title}>
							{item.title}
						</Typography>

						<Typography variant="body2" color="text.secondary">
							{item.year ? item.year : "Year unknown"}
						</Typography>

						<Stack direction="row" spacing={1} flexWrap="wrap">
							<Chip size="small" label={item.status} />
						</Stack>
					</Stack>
				</CardContent>
			</CardActionArea>
		</Card>
	);
}
