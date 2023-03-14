export { };

declare global {
	namespace sc {
		interface ItemTabbedBox {
			rarityFilter: nax.inventorySearch.RarityFilterButtonDropdown;
			rarityFilterButton: sc.ButtonGui;
			tabs: {[index: string]: sc.ItemTabbedBox.TabButton};
			_lastCursorPos: {x: number, y: number, scroll: number}[];
			list: MultiColumnItemListBox;
			// @ts-ignore
			inputField: nax.ccuilib.InputField;

			rarityFilterButtonPress(this: this): void;
			_rearrangeTabs(this: this): void;
			showMenu(this: this): void;
			exitMenu(this: this): void;
			search_field: sc.ButtonGroup;
		}
	}
}