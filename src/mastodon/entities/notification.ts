/// <reference path="account.ts" />
/// <reference path="status.ts" />

namespace MastodonEntity {
  export type Notification = {
    account: Account
    created_at: string
    id: string
    status?: Status
    type: NotificationType
  }

  export type NotificationType = string

  export const NotificationTypeMention: NotificationType = 'mention'
  export const NotificationTypeReblog: NotificationType = 'reblog'
  export const NotificationTypeFavourite: NotificationType = 'favourite'
  export const NotificationTypeFollow: NotificationType = 'follow'
  export const NotificationTypePoll: NotificationType = 'poll'
  export const NotificationTypeFollowRequest: NotificationType = 'follow_request'
  export const NotificationTypeUnknown: NotificationType = 'unknown'
}
