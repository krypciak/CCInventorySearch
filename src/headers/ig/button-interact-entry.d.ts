export { };

declare global {
	namespace ig {
		interface ButtonInteractEntry {
			removeButtonGroup(buttonGroup: sc.ButtonGroup): void;
			addParallelGroup(buttonGroup: sc.ButtonGroup): void;
			removeParallelGroup(buttonGroup: sc.ButtonGroup): void;
		}
	}
}