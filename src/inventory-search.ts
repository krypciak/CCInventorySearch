// @ts-nocheck

ig.module("nax-inventory-search.inventory-search").requires(
	"game.feature.menu.gui.item.item-list",
	"game.feature.menu.menu-model",
	"impact.feature.gui.base.box",
	"nax-ccuilib.ui.input-field",
	"nax-inventory-search.rarity-filter-button-dropdown"
).defines(function () {
	sc.ItemTabbedBox.inject({
		rarityFilter: null,
		rarityFilterButton: null,
		init(...args) {
			this.parent(...args);

			const index = this.tabArray.length
			// Create the new tab button
			let searchTabButton = this._createTabButton(
				"search",
				"item-search",
				index,
				// @ts-ignore Enum hackery
				"SEARCH"
			);

			// Add to the tabs array
			this.tabs.search = searchTabButton;

			// Add this so that last cursor position is stored for items
			this._lastCursorPos[index] = {
				x: 0,
				y: 0,
				scroll: 0,
			};

			// Background size
			this.hook.children[0].size.x = 368;

			this.hook.children[3].size.x = 363;

			// Right adjusted position for the "Quantity" text
			// @ts-ignore
			this.list.quantities[0].hook.pos.x = 187;
			// @ts-ignore
			this.list.quantities[1].hook.pos.x = 4;

			//this.list.list.hook.width = 368;

			this.setSize(368, 260);
			this.list.setSize(368, 230);

			// @ts-ignore Add the text input field
			this.inputField = new nax.ccuilib.InputField(260, 20);
			this.inputField.onCharacterInput = () => {
				// @ts-ignore
				sc.menu.searchInventory(searchTabButton);
				if (this.inputField.textChild.textBlock.size.x > this.inputField.dummyForClipping.hook.size.x) {
					this.inputField.textChild.setAlign(ig.GUI_ALIGN.X_RIGHT, ig.GUI_ALIGN.Y_TOP);
				} else {
					this.inputField.textChild.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);
				}
			}

			this.inputField.hook.transitions = {
				DEFAULT: {
					state: {},
					time: 0.3,
					timeFunction: KEY_SPLINES.LINEAR
				},
				HIDDEN: {
					state: {
						alpha: 0
					},
					time: 0.3,
					timeFunction: KEY_SPLINES.LINEAR
				}
			};

			this.inputField.setPos(2, 28);
			this.inputField.doStateTransition("HIDDEN", true);
			this.addChildGui(this.inputField);

			// Add the rarity filter
			this.rarityFilter = new nax.inventorySearch.RarityFilterButtonDropdown();
			this.rarityFilterButton = new sc.ButtonGui("All", void 0, true, sc.BUTTON_TYPE.SMALL); // new sc.RarityFilterButtonDropdown();
			this.rarityFilterButton.setWidth(102);
			this.rarityFilterButton.keepMouseFocus = true;
			this.rarityFilterButton.hook.transitions = {
				DEFAULT: {
					state: {},
					time: 0.3,
					timeFunction: KEY_SPLINES.LINEAR
				},
				HIDDEN: {
					state: {
						alpha: 0
					},
					time: 0.3,
					timeFunction: KEY_SPLINES.LINEAR
				}
			};
			this.rarityFilterButton.onButtonPress = this.rarityFilterButtonPress.bind(this, this.rarityFilterButton);
			this.rarityFilterButton.setPos(
				this.inputField.hook.size.x + this.inputField.hook.pos.x + 2,
				this.inputField.hook.pos.y
			);

			// @ts-ignore
			this.rarityFilterButton.hook.screenCoords = {};
			this.rarityFilterButton.doStateTransition("HIDDEN", true);

			this.rarityFilter.buttonGroup.addPressCallback(function (value) {
				this.rarityFilterButton.setText(value.text);
				this.rarityFilterButton.setWidth(102);
			}.bind(this));

			this.addChildGui(this.rarityFilterButton);


			// Any interact-able elements need to be a part of a ButtonGroup
			this.search_field = new sc.ButtonGroup();
			this.search_field.addFocusGui(this.inputField);
			this.search_field.addFocusGui(this.rarityFilterButton);

			this.tabGroup.addPressCallback(function () {
				this.inputField.unsetFocus();
				this.rarityFilter.hide();
			}.bind(this));

			// Do this so that our tab is at the end
			this._rearrangeTabs();
			this.doStateTransition("HIDDEN", true);
		},

		rarityFilterButtonPress: function () {
			if (this.rarityFilter.active) this.rarityFilter.hide();
			else {
				ig.gui.addGuiElement(this.rarityFilter);
				//let pos = absolutePos(this.rarityFilterButton.hook);
				this.rarityFilter.show(this.rarityFilterButton);
			}
		},

		showMenu() {
			sc.menu.buttonInteract.addParallelGroup(this.search_field);
			this.parent();
		},

		exitMenu() {
			sc.menu.buttonInteract.removeParallelGroup(this.search_field);
			this.parent();
		},

		_createList(b, a, d, c, e, sort_type, filter_rarity) {
			if (b === "SEARCH") {
				this.list.hook.pos.y = 49;
				this.list.setSize(368, 210);
				this.parent("NEW", a, d, c, e, sort_type);
				this.inputField.doStateTransition("DEFAULT", true);
				this.rarityFilterButton.doStateTransition("DEFAULT", true);

				// Do the list creation
				if (sort_type === void 0) {
					this._bgRev.clear();
					this.list.clear(d);
					this.list.setQuantityState("DEFAULT");
					let player = sc.model.player;

					let inventory = Object.entries(player.items)
						.filter(([id, count]) => player.isEquipped(id) || count > 0) // Remove items we don't have
						.map(([id]) => id); // Keep only the IDs

					if (filter_rarity != void 0 && filter_rarity >= 0) {
						inventory = inventory.filter(id => sc.inventory.getItem(id).rarity == filter_rarity);
					}

					inventory = inventory.sort((a, b) => sc.inventory.getItemName(a).localeCompare(sc.inventory.getItemName(b)));

					let query = this.inputField.getValueAsString().toLowerCase();


					for (let index = 0; index < inventory.length; index++) {
						let itemID = inventory[index];
						let amount = player.items[itemID] || 0;
						let item = sc.inventory.getItem(itemID);

						// If the name doesn't match the query, sod the rest of the loop
						if (!(ig.LangLabel.getText(item.name).toLowerCase().includes(query))) continue;

						// let itemName = new ig.LangLabel(item.name);
						let itemName = "\\i[" + (item.icon + sc.inventory.getRaritySuffix(item.rarity || 0) || "item-default") + "]";
						itemName = itemName + ig.LangLabel.getText(item.name);
						let itemDescription = ig.LangLabel.getText(item.description);

						let itemLevel = 0;
						if (item.type == sc.ITEMS_TYPES.EQUIP) {
							itemLevel = item.level || 1
						}

						let itemButton = new sc.ItemBoxButton(
							itemName,
							142,
							26,
							amount,
							itemID,
							itemDescription,
							void 0,
							void 0,
							void 0,
							void 0,
							itemLevel
						);

						if (amount == 0 && item.equipType && player.isEquipped(itemID)) {
							amount = player.getItemAmountWithEquip(itemID);
							itemButton.amount.setNumber(amount, true);
							this._addEquipOverlay(itemButton, 1);
						}

						if (amount == 0) {
							itemButton.setActive(false);
						}

						itemButton.button.submitSound = null;

						player.isFavorite(itemID) && this._addFavoriteOverlay(itemButton);
						this.list.addButton(itemButton);
					}
				}

			} else {
				this.inputField.doStateTransition("HIDDEN", true);
				this.rarityFilterButton.doStateTransition("HIDDEN", true);
				this.list.setSize(368, 230);
				this.list.hook.pos.y = 29;
				this.parent(b, a, d, c, e, sort_type);
			}

			if (b != sc.ITEMS_TYPES.TOGGLE) {
				this.list.list.contentPane.hook.children.forEach((itemButton, i) => {
					itemButton.size.x = 182;
					if (i % 2 != 0) {
						itemButton.pos.x = 183;
					}
				});
			} else {
				//this.list.list.contentPane.hook.children[0].size.x = 357;
				this.list.list.contentPane.hook.children.forEach(toggleSet => {
					toggleSet.gui.line.setSize(368, 1);
					toggleSet.gui.background.hook.size.x = 368;

					toggleSet.gui.buttons.forEach((button, i) => {
						button.setWidth(180);
						button._actualLineWidth = -1;
						if (i % 2 != 0) {
							button.setPos(182, button.hook.pos.y);
						}
						button.updateToggleState();
					})
				});
			}
		},

		modelChanged(b, menu_event, d) {
			if (b == sc.menu) {
				if (menu_event == sc.MENU_EVENT.SEARCH_LIST) {
					b = sc.menu.itemLastButtonData;
					this._createList(
						b.type,
						b.subType,
						true,
						ig.input.mouseGuiActive,
						!ig.input.mouseGuiActive
					);
				} else if (menu_event == sc.MENU_EVENT.FILTER_LIST) {
					b = sc.menu.itemLastButtonData;
					this._createList(
						b.type,
						b.subType,
						true,
						ig.input.mouseGuiActive,
						!ig.input.mouseGuiActive,
						void 0,
						d.data.value
					);
				} else {
					this.parent(b, menu_event, d);
				}
			}
		},

		setFavorite() {
			if (this._curElement && sc.menu.itemCurrentTab == 9) {
				let itemID = this._curElement.data.id;
				if (
					(
						sc.model.player.canAddFavorite() ||
						sc.model.player.isFavorite(itemID)
					) &&
					sc.inventory.isConsumable(itemID)
				) {
					this.favSound && this.favSound.play();
					sc.model.player.updateFavorite(itemID) ?
						this._addFavoriteOverlay(this._curElement) :
						this._removeFavoriteOverlay(this._curElement);
				} else {
					this.errorSound.play();
				}
			} else {
				this.parent();
			}
		},
	});

	sc.MenuModel.inject({
		searchInventory(a) {
			sc.Model.notifyObserver(this, sc.MENU_EVENT.SEARCH_LIST, a);
		},

		filterList(sender) {
			sc.Model.notifyObserver(this, sc.MENU_EVENT.FILTER_LIST, sender);
		}
	});

	sc.ItemMenu.inject({
		modelChanged(b, a, d) {
			this.parent(b, a, d)
			if (a == sc.MENU_EVENT.ITEM_CHANGED_TAB && sc.menu.itemCurrentTab == 9) {
				this.hotkeySort.setActive(false); // Disable the dropdown
			}
		}
	});
});

function registerMenuEvent(name) {
	sc.MENU_EVENT[name] = Math.max(...Object.values(sc.MENU_EVENT)) + 1;
}

registerMenuEvent("SEARCH_LIST");
registerMenuEvent("FILTER_LIST");

const SEARCH_ICON = new ig.Font("media/font/icons-search.png", 16, ig.MultiFont.ICON_START);

let newFontIndex = sc.fontsystem.font.iconSets.length;

sc.fontsystem.font.pushIconSet(SEARCH_ICON);
sc.fontsystem.font.setMapping({
	"item-search": [newFontIndex, 0]
});
