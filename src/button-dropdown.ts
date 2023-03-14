ig.module("nax-inventory-search.button-dropdown").requires(
	"impact.feature.gui.base.basic-gui",
	"impact.feature.gui.base.box",
	"impact.feature.gui.gui",
	"game.feature.menu.gui.item.item-sort-menu" // Just so we can copy some of it's properties
).defines(function () {
	nax.inventorySearch.ButtonDropDown = ig.BoxGui.extend({
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
		onChangeCallback: null,
		onBackCallback: null,
		currentValue: null,
		init(width: any, height: any, onChangeCallback, onBackCallback) {
			this.parent(width, height);

			this.setPivot(width, 0); // Is this needed?
			this.setAlign(ig.GUI_ALIGN.X_LEFT, ig.GUI_ALIGN.Y_TOP);
			this.onChangeCallback = onChangeCallback;
			this.onBackCallback = onBackCallback;

			this.hook.zIndex = 1500; // Put it on top?
			this.hook.pauseGui = true; // Not sure what this does
			this.hook.screenBlocking = true; // Presumably triggers an overlay?

			// @ts-ignore
			this.buttonGroup = new sc.ButtonGroup(ig.BUTTON_GROUP_SELECT_TYPE.VERTICAL, false);
			this.buttonGroup.addPressCallback((value: any) => {
				this.currentValue = value.name;
				if (this.onChangeCallback) this.onChangeCallback(value);
			});

			this.buttonGroup.addSelectionCallback((value: any) => {
				if (value.data && value.data.description) {
					// @ts-ignore
					sc.menu.setInfoText(value.data.description);
				}
			});

			this.buttonGroup.setMouseFocusLostCallback(() => {
				// @ts-ignore
				sc.menu.setInfoText("", true)
			});
		},

		addButton(label, description, value) {
			this.yPosition = this._createButton(label, description, value, this.yPosition);

			this.hook.size.y = this.yPosition + 2; // Set the size of this to encompass all the buttons + 2 pixels for padding
		},

		setButtonKey(index, label, description) {
			this.buttons[index].setText(ig.lang.get(label), true);
			// @ts-ignore
			this.buttons[index].data.description = ig.lang.get(description);
		},

		show(ui) {
			// Screen coords are always available here
			this.showAt(
				// @ts-ignore
				ui.hook.screenCoords.x - this.hook.size.x + ui.hook.size.x,
				// @ts-ignore
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
			this.onBackCallback && this.onBackCallback();
		},

		_createButton(label, description, value, y) {
			y ??= 0;

			let button = new sc.ButtonGui(
				ig.lang.get(label),
				this.hook.size.x - 6, // Artificial margin when padding, 3px either side
				true,
				sc.BUTTON_TYPE.ITEM
			);

			button.textChild.setPos(0, 0);
			button.textChild.setAlign(ig.GUI_ALIGN.X_CENTER, ig.GUI_ALIGN.Y_CENTER);
			// @ts-ignore
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
