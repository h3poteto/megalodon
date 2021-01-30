/// <reference path="account.ts" />
/// <reference path="status.ts" />

namespace Entity {
  export type Notification = {
    account: Account
    created_at: string
    id: string
    status?: Status
    emoji?: string
    type: NotificationType
  }

  export type NotificationType = string

  export const NotificationTypeMention: NotificationType = 'mention'
  export const NotificationTypeReblog: NotificationType = 'reblog'
  export const NotificationTypeFavourite: NotificationType = 'favourite'
  export const NotificationTypeFollow: NotificationType = 'follow'
  export const NotificationTypePoll: NotificationType = 'poll'
  export const NotificationTypeEmojiReaction: NotificationType = 'emoji_reaction'
  export const NotificationTypeFollowRequest: NotificationType = 'follow_request'
  export const NotificationTypeUnknown: NotificationType = 'unknown'
}
