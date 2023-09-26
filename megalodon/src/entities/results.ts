/// <reference path="account.ts" />
/// <reference path="status.ts" />
/// <reference path="tag.ts" />

namespace Entity {
	export type Results = {
		accounts: Array<Account>;
		statuses: Array<Status>;
		hashtags: Array<Tag>;
	};
}
