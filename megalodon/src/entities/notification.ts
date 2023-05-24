/// <reference path="account.ts" />
/// <reference path="status.ts" />
/// <reference path="reaction.ts" />

namespace Entity {
  export type Notification = {
    account: Account
    created_at: string
    id: string
    status?: Status
    emoji?: string
    emoji_reaction?: Reaction
    type: NotificationType
    target?: Account
  }

  export type NotificationType = string
}
