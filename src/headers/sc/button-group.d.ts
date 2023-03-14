export { };

declare global {
	namespace sc {
		interface ButtonGroup {
			setMouseFocusLostCallback(this: this, callback: () => void): void;
			addFocusGui(this: this, focusGui: ig.FocusGui, x?: number, y?: number): void;
		}

		interface ButtonGroupConstructor extends ImpactClass<ButtonGroup> {
			new(selectionType?: ig.BUTTON_GROUP_SELECT_TYPE, loopBuuttons?: boolean, sound?: ig.Sound): ButtonGroup;
		}

		var ButtonGroup: ButtonGroupConstructor;
	}
}