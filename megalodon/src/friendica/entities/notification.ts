/// <reference path="account.ts" />
/// <reference path="status.ts" />

namespace FriendicaEntity {
  export type Notification = {
    account: Account
    created_at: string
    id: string
    status?: Status
    type: NotificationType
  }

  export type NotificationType = string
}
