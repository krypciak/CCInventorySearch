export { };

declare global {
	namespace nax {
		namespace inventorySearch {

			type OnChangeCallback = undefined | ((data: any) => void);

			interface ButtonDropDown extends ig.BoxGui {
				onChangeCallback: OnChangeCallback;
				onBackCallback: undefined | (() => void);
				buttonGroup: sc.ButtonGroup;
				active: boolean;
				yPosition: number;
				currentValue: sc.TextLike;
				buttons: sc.ButtonGui[];

				addButton(this: this, label: string, description: string, value: any): void;
				_createButton(this: this, label: string, description: string, value: any, y?: number): number;

				onButtonPress(this: this, button: sc.ButtonGui): void;
				onBackButtonPress(this: this): void;

				hide(this: this): void;
				show(this: this, ui: ig.GuiElementBase): void;
				showAt(this: this, x: number, y: number): void;
				setButtonKey(this: this, index: number, label: string, description: string): void;
			}

			interface ButtonDropDownCon extends ImpactClass<ButtonDropDown> {
				new(width: number, height: number, onChangeCallback: OnChangeCallback, onBack?: () => void): ButtonDropDown;
			}

			let ButtonDropDown: ButtonDropDownCon;
		}
	}
}