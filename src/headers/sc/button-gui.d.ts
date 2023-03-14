export { };

declare global {
	namespace sc {
		interface ButtonGui {
			setData(this: this, data: any): void;
			keepMouseFocus: boolean;
		}
	}
}