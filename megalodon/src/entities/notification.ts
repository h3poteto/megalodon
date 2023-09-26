/// <reference path="account.ts" />
/// <reference path="status.ts" />

namespace Entity {
  export type Notification = {
    account: Account | null
    created_at: string
    id: string
    status?: Status
    emoji?: string
    reaction?: Reaction
    type: NotificationType
    target?: Account
  }

  export type NotificationType = string
}
