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

  export const NotificationTypeFollow: NotificationType = 'follow'
  export const NotificationTypeMention: NotificationType = 'mention'
  export const NotificationTypeReply: NotificationType = 'reply'
  export const NotificationTypeRenote: NotificationType = 'renote'
  export const NotificationTypeQuote: NotificationType = 'quote'
  export const NotificationTypeReaction: NotificationType = 'reaction'
  export const NotificationTypePollVote: NotificationType = 'pollVote'
  export const NotificationTypeReceiveFollowRequest: NotificationType = 'receiveFollowRequest'
  export const NotificationTypeFollowRequestAccepted: NotificationType = 'followRequestAccepted'
  export const NotificationTypeGroupInvited: NotificationType = 'groupInvited'
  export const NotificationTypeUnknown: NotificationType = 'unknown'
}
