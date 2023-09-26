/// <reference path="status.ts" />

namespace Entity {
	export type Context = {
		ancestors: Array<Status>;
		descendants: Array<Status>;
	};
}
