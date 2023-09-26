/// <reference path="account.ts" />

namespace Entity {
	export type Reaction = {
		count: number;
		me: boolean;
		name: string;
		url?: string;
		static_url?: string;
		accounts?: Array<Account>;
	};
}
