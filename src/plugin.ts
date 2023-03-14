// @ts-nocheck

/// <reference path="global.d.ts" />

import { Mod, PluginClass } from 'ultimate-crosscode-typedefs/modloader/mod';

export default class inventorySearch implements PluginClass {

	mod: Mod;

	constructor(mod: Mod) {
		this.mod = mod;
	}

	prestart() {
		window.moduleCache.registerModPrefix("nax-inventory-search", this.mod.baseDirectory.substring(7));
		window.nax = window.nax ?? {};
		window.nax.inventorySearch = window.nax.inventorySearch ?? {};
		ig.lib = this.mod.baseDirectory.substring(7);
		ig._loadScript("nax-inventory-search.inventory-search");
	}

	postload() {
		ig.lib = "";
	}
}