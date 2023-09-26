/// <reference path="user.ts" />
/// <reference path="note.ts" />

namespace FirefishEntity {
	export type Notification = {
		id: string;
		createdAt: string;
		type: NotificationType;
		userId?: string | null;
		user?: User;
		note?: Note;
		reaction?: string | null;
	};

	export type NotificationType = string;
}
