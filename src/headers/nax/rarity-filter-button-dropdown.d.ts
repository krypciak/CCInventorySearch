export { };

declare global {
	namespace nax {
		namespace inventorySearch{
			interface RarityFilterButtonDropdown extends nax.inventorySearch.ButtonDropDown {

			}

			interface RarityFilterButtonDropdownCon extends ImpactClass<RarityFilterButtonDropdown> {
				new(): RarityFilterButtonDropdown;
			}

			let RarityFilterButtonDropdown: RarityFilterButtonDropdownCon;
		}
	}
}