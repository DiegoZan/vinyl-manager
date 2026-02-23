import { Routes, Route, Navigate } from "react-router-dom";
import CollectionPage from "../pages/Collection";
import ReleaseDetailsPage from "../pages/ReleaseDetails";

export default function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<CollectionPage />} />
			<Route path="/releases/:id" element={<ReleaseDetailsPage />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}
