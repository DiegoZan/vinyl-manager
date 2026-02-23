import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImportFromDiscogsDialogView from "./ImportFromDiscogsDialog.component.jsx";

function renderDialog(overrides = {}) {
	const props = {
		open: true,
		onClose: () => {},

		mode: "barcode",
		onModeChange: () => {},

		barcode: "",
		onBarcodeChange: () => {},

		artist: "",
		onArtistChange: () => {},

		title: "",
		onTitleChange: () => {},

		catno: "",
		onCatnoChange: () => {},

		searching: false,
		searchError: null,
		results: [],
		onSearch: () => {},

		importing: false,
		importError: null,
		onSelectResult: () => {},

		...overrides,
	};

	return render(<ImportFromDiscogsDialogView {...props} />);
}

describe("ImportFromDiscogsDialogView", () => {
	it("disables Search button when barcode mode has empty input", () => {
		renderDialog({ mode: "barcode", barcode: "" });
		expect(screen.getByRole("button", { name: /search/i })).toBeDisabled();
	});

	it("enables Search button when barcode is provided", () => {
		renderDialog({ mode: "barcode", barcode: "123456789" });
		expect(screen.getByRole("button", { name: /search/i })).toBeEnabled();
	});

	it("enables Search button in artist+title mode when at least one field is provided", async () => {
		const user = userEvent.setup();

		// This test uses controlled props; easiest is to render with a value already set
		renderDialog({ mode: "artistTitle", artist: "Nirvana", title: "" });

		expect(screen.getByRole("button", { name: /search/i })).toBeEnabled();
		await user.click(screen.getByRole("tab", { name: /barcode/i })); // just to ensure tabs render
	});
});
