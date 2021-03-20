ig.module("nax-text-field").requires(
	"impact.feature.gui.base.box",
	"impact.feature.gui.gui"
).defines(function () {
	sc.INPUT_FIELD_TYPE = {};
	sc.INPUT_FIELD_TYPE.DEFAULT = {
		height: 20,
		ninepatch: new ig.NinePatch("media/gui/buttons.png", {
			width: 13,
			height: 18,
			left: 1,
			top: 1,
			right: 2,
			bottom: 2,
			offsets: {
				"default": {
					x: 184,
					y: 24
				},
				focus: {
					x: 184,
					y: 24
				},
				pressed: {
					x: 184,
					y: 24
				},
			}
		}),
		highlight: {
			startX: 200,
			endX: 215,
			leftWidth: 2,
			rightWidth: 2,
			offsetY: 24,
			gfx: new ig.Image("media/gui/buttons.png"),
			pattern: new ig.ImagePattern(
				"media/gui/buttons.png",
				202,
				24,
				11,
				20,
				ig.ImagePattern.OPT.REPEAT_X,
			)
		}
	}

	ig.GuiTextInputFieldBG = ig.BoxGui.extend({
		gfx: new ig.Image("media/gui/buttons.png"),
		ninepatch: new ig.NinePatch("media/gui/buttons.png", {
			width: 13,
			height: 18,
			left: 1,
			top: 1,
			right: 2,
			bottom: 2,
			offsets: {
				"default": {
					x: 184,
					y: 24
				},
				focus: {
					x: 184,
					y: 24
				}
			}
		}),

		init: function (hook) {
			this.parent(hook.width, hook.height, false, this.ninepatch);
		}
	});

	ig.GuiTextInputField = ig.FocusGui.extend({
		gfx: new ig.Image("media/gui/buttons.png"),
		value: [],
		bg: null,
		focusTimer: 0,
		alphaTimer: 0,
		animateOnPress: false,
		noFocusOnPressed: false,
		submitSound: null,
		blockedSound: null,
		inputField_type: null,
		boundProcessInput: null,
		validChars: null,
		cursorChar: "_",
		onCharacterInput: void(0),
		dummyForClipping: null,
		init: function (width, height, inputField_type) {
			this.parent(true);
			this.setSize(width, height);

			this.hook.clip = true;

			this.inputField_type = inputField_type || sc.INPUT_FIELD_TYPE.DEFAULT;

			this.submitSound = sc.BUTTON_SOUND.submit;
			this.blockedSound = sc.BUTTON_SOUND.denied;

			this.bg = new sc.ButtonBgGui(this.hook.size.x, this.inputField_type);
			this.bg.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);
			this.bg.hook.size = this.hook.size;
			this.addChildGui(this.bg);

			this.highlight = new sc.ButtonHighlightGui(this.hook.size.x, this.inputField_type);
			this.addChildGui(this.highlight);

			this.textChild = new sc.TextGui(this.value, {
				speed: ig.TextBlock.SPEED.IMMEDIATE,
			});

			this.textChild.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);

			this.dummyForClipping = new sc.DummyContainer(this.textChild);
			this.dummyForClipping.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);
			this.dummyForClipping.setPos(4, 1);
			this.dummyForClipping.setSize(width - 8, height);
			this.addChildGui(this.dummyForClipping);

			this.boundProcessInput = this.processInput.bind(this);
			this.validChars = /[a-zA-Z0-9,! ]*/;
		},

		focusGained: function () {
			this.parent();
			ig.input.ignoreKeyboard = true;
			window.addEventListener("keydown", this.boundProcessInput, false);
		},

		focusLost: function () {
			this.parent();
			ig.input.ignoreKeyboard = false;
			window.removeEventListener("keydown", this.boundProcessInput);
		},

		processInput: function (event) {
			let old = this.getValueAsString();
			if (event.key.length === 1 && this.validChars.test(event.key)) {
				this.value.push(event.key)
			} else if (event.which === 8 && this.value.length > 0) { // Backspace
				this.value.pop();
			}
			let text = this.getValueAsString();
			if (text !== old) {
				this.textChild.setText(text + this.cursorChar);
				this.onCharacterInput(text, event.key);
			}
		},

		getValueAsString: function () {
			return this.value.join("");
		},

		// Copied from ButtonGui
		update: function () {
			this.parent();

			if (this.keepPressed && this.pressed && this.animateOnPress) {
				// If this element is currently focussed 
				if (this.focus) {
					this.alphaTimer = (this.alphaTimer + ig.system.actualTick) % 1;
				} else {
					this.alphaTimer = 0;
					this.focusTimer = 0.1;
				}
			} else if (this.keepPressed && this.pressed && !this.noFocusOnPressed) {
				this.focusTimer = this.focusTimer + ig.system.actualTick;
				if (this.focusTimer > 0.1) this.focusTimer = 0.1; // This line is made redundant by this.focusTimer.limit(0, 0.1);
				this.alphaTimer = 0;
			} else if (this.focus && this.focusTimer < 0.1) { // If we are focussing and the focus timer is less than max, increase the focus timer
				this.focusTimer = this.focusTimer + ig.system.actualTick;
				this.alphaTimer = 0;
			} else if (!this.focus && this.focusTimer > 0) { // If we are no longer focussing, reduce the focus timer
				this.focusTimer = this.focusTimer - ig.system.actualTick;
				this.alphaTimer = 0;
			} else {
				this.alphaTimer = (this.alphaTimer + ig.system.actualTick) % 1;
			}
			this.focusTimer.limit(0, 0.1);
			this.bg.currentTileOffset = this.keepPressed && this.pressed ?
				"pressed" :
				this.focus ?
				"focus" :
				"default";
			if (this.highlight) {
				this.highlight.focusWeight = this.focusTimer / 0.1;
				var a = this.alphaTimer / 1,
					a = KEY_SPLINES.EASE_IN_OUT.get(
						1 - (a > 0.5 ? 1 - (a - 0.5) * 2 : a * 2),
					),
					a = 0.8 * a + 0.2;
				this.active || (a = a * 0.5);
				this.highlight.hook.localAlpha = a;
			}
		},

		unsetFocus: function () {
			this.focus = false;
			this.setPressed(false);
			if (this.highlight) {
				this.highlight.hook.localAlpha = 0;
				this.highlight.focusWeight = 0;
			}
			this.focusTimer = this.alphaTimer = 0;
		},

		invokeButtonPress: function (a) {
			this.submitSound && this.submitSound.play();
			this.onButtonPress(a);
		},

		setData: function (a) {
			if (a != void 0) this.data = a;
		},
	});
});

ig.module("nax-button-dropdown").requires(
	"impact.feature.gui.base.basic-gui",
	"impact.feature.gui.base.box",
	"impact.feature.gui.gui",
	"game.feature.menu.gui.item.item-sort-menu" // Just so we can copy some of it's properties
).defines(function () {
	sc.ButtonDropDown = ig.BoxGui.extend({
		ninepatch: new ig.NinePatch("media/gui/menu.png", {
			width: 8,
			height: 8,
			left: 8,
			top: 8,
			right: 8,
			bottom: 8,
			offsets: {
				"default": {
					x: 480,
					y: 304
				}
			}
		}),
		transitions: {
			HIDDEN: {
				state: {
					alpha: 0,
					scaleX: 0.2,
					scaleY: 0
				},
				time: 0.2,
				timeFunction: KEY_SPLINES.LINEAR
			},
			DEFAULT: {
				state: {},
				time: 0.2,
				timeFunction: KEY_SPLINES.EASE
			}
		},
		buttonGroup: null,
		buttons: [],
		active: false,
		yPosition: 3,
		callback: null,
		backCallback: null,
		currentValue: null,
		pos: Vec2.create(),
		init(width, height, onChangeCallback, onBack) {
			this.parent(width, height);

			this.setPivot(width, 0); // Is this needed?
			this.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);
			this.callback = onChangeCallback;
			this.backCallback = onBack;

			this.hook.zIndex = 1500; // Put it on top?
			this.hook.pauseGui = true; // Not sure what this does
			this.hook.screenBlocking = true; // Presumably triggers an overlay?

			this.buttonGroup = new sc.ButtonGroup(false, ig.BUTTON_GROUP_SELECT_TYPE.VERTICAL);
			this.buttonGroup.addPressCallback(function (value) {
				this.currentValue = value.name;
				if (this.callback) this.callback(value);
			}.bind(this));

			this.buttonGroup.addSelectionCallback(function (value) {
				if (value.data && value.data.description) {
					sc.menu.setInfoText(value.data.description);
				}
			}.bind(this));

			this.buttonGroup.setMouseFocusLostCallback(function () {
				sc.menu.setInfoText("", true)
			}.bind(this));
		},

		addButton(label, description, value) {
			this.yPosition = this._createButton(label, description, value, this.yPosition);

			this.hook.size.y = this.yPosition + 2; // Set the size of this to encompass all the buttons + 2 pixels for padding
		},

		setButtonKey(index, label, description) {
			this.button[index].setText(ig.lang.get(label), true);
			this.button[index].data.description = ig.lang.get(description);
		},

		show(ui) {
			this.showAt(
				ui.hook.screenCoords.x - this.hook.size.x + ui.hook.size.x,
				ui.hook.screenCoords.y + ui.hook.size.y
			);
		},

		showAt(x, y) {
			if (!this.active) {
				sc.menu.pushBackCallback(this.onBackButtonPress.bind(this));
				sc.menu.buttonInteract.pushButtonGroup(this.buttonGroup);
				this.setPos(x, y);
				this.active = true;
				this.doStateTransition("DEFAULT");
			}
		},

		hide() {
			if (this.active) {
				this.active = false;
				sc.menu.popBackCallback();
				sc.menu.buttonInteract.removeButtonGroup(this.buttonGroup);
				this.doStateTransition("HIDDEN", false, true);
			}
		},

		onBackButtonPress() {
			this.hide();
			this.backCallback && this.backCallback();
		},

		_createButton(label, description, value, y) {
			let button = new sc.ButtonGui(
				ig.lang.get(label),
				this.hook.size.x - 6, // Artificial margin when padding, 3px either side
				true,
				sc.BUTTON_TYPE.ITEM
			);

			button.textChild.setPos(0, 0);
			button.textChild.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
			button.setData({
				value: value,
				description: ig.lang.get(description),
				name: button.text
			});

			button.setPos(3, y);

			this.buttonGroup.addFocusGui(button, 0, this.buttons.length);
			if (this.buttons.length == 0)
				this.currentValue = button.text;

			this.buttons.push(button);
			this.addChildGui(button);

			return y + button.hook.size.y;
		}
	})
});

ig.module("nax-rarity-filter-button-drop-down").requires().defines(function () {

	sc.RarityFilterButtonDropdown = sc.ButtonDropDown.extend({
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

		onButtonPress(b, button) {
			if (b.data) {
				this.hide();
				sc.menu.filterList(b);
			}
		}
	});
});

ig.module("nax-inventory-search").requires(
	"game.feature.menu.gui.item.item-list",
	"game.feature.menu.menu-model",
	"impact.feature.gui.base.box",
	"nax-text-field",
	"nax-rarity-filter-button-drop-down"
).defines(function () {
	sc.ItemTabbedBox.inject({
		rarityFilter: null,
		rarityFilterButton: null,
		init(...args) {
			this.parent(...args);

			// Create the new tab button
			let searchTabButton = this._createTabButton(
				"search",
				"item-search",
				9,
				"SEARCH"
			);

			// Add to the tabs array
			this.tabs.search = searchTabButton;

			// Add this so that last cursor position is stored for items
			this._lastCursorPos[9] = {
				x: 0,
				y: 0,
				scroll: 0,
			};

			// Background size
			this.hook.children[0].size.x = 368;

			this.hook.children[3].size.x = 363;

			// Right adjusted position for the "Quantity" text
			this.list.quantities[0].hook.pos.x = 187;
			this.list.quantities[1].hook.pos.x = 4;

			//this.list.list.hook.width = 368;

			this.setSize(368, 260);
			this.list.setSize(368, 230);

			// Add the text input field
			this.inputField = new ig.GuiTextInputField(260, 20);
			this.inputField.onCharacterInput = () => {
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
			this.rarityFilter = new sc.RarityFilterButtonDropdown();
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