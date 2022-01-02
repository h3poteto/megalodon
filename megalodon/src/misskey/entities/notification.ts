/// <reference path="user.ts" />
/// <reference path="note.ts" />

namespace MisskeyEntity {
  export type Notification = {
    id: string
    createdAt: string
    // https://github.com/syuilo/misskey/blob/056942391aee135eb6c77aaa63f6ed5741d701a6/src/models/entities/notification.ts#L50-L62
    type: NotificationType
    userId: string
    user: User
    note?: Note
    reaction?: string
  }

  export type NotificationType = string
}
