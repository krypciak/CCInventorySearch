ig.module("nax-inventory-search.rarity-filter-button-dropdown")
	.requires("nax-inventory-search.button-dropdown")
	.defines(function () {

		nax.inventorySearch.RarityFilterButtonDropdown = nax.inventorySearch.ButtonDropDown.extend({
			init() {
				this.parent(102, 85, this.onButtonPress.bind(this));
				[{
					text: "all",
					value: -1
				},
				{
					text: "low",
					value: sc.ITEMS_RARITY.LOW
				},
				{
					text: "normal",
					value: sc.ITEMS_RARITY.NORMAL
				},
				{
					text: "rare",
					value: sc.ITEMS_RARITY.RARE
				},
				{
					text: "legendary",
					value: sc.ITEMS_RARITY.LEGENDARY
				},
				{
					text: "unique",
					value: sc.ITEMS_RARITY.UNIQUE
				},
				{
					text: "backer",
					value: sc.ITEMS_RARITY.BACKER
				},
				{
					text: "scale",
					value: sc.ITEMS_RARITY.SCALE
				},
				].forEach(item => {
					this.addButton(
						"sc.gui.mod-inv-search.filter.rarity.name." + item.text,
						"sc.gui.mod-inv-search.filter.rarity.description." + item.text,
						item.value
					);
				})
			},

			onButtonPress(b) {
				if (b.data) {
					this.hide();
					// @ts-ignore
					sc.menu.filterList(b);
				}
			}
		});
	});
