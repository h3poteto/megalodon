namespace Entity {
	export type Preferences = {
		"posting:default:visibility": "public" | "unlisted" | "private" | "direct";
		"posting:default:sensitive": boolean;
		"posting:default:language": string | null;
		"reading:expand:media": "default" | "show_all" | "hide_all";
		"reading:expand:spoilers": boolean;
	};
}
