/// <reference path="account.ts" />
/// <reference path="status.ts" />

namespace PleromaEntity {
  export type Notification = {
    account: Account
    created_at: string
    id: string
    status?: Status
    emoji?: string
    type: NotificationType
    target?: Account
  }

  export type NotificationType = string
}
