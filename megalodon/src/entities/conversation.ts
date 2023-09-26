/// <reference path="account.ts" />
/// <reference path="status.ts" />

namespace Entity {
	export type Conversation = {
		id: string;
		accounts: Array<Account>;
		last_status: Status | null;
		unread: boolean;
	};
}
