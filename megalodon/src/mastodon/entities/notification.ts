/// <reference path="account.ts" />
/// <reference path="status.ts" />

namespace MastodonEntity {
  export type Notification = {
    account: Account
    created_at: string
    id: string
    emoji_reaction?: Reaction // Fedibird Only Support
    status?: Status
    type: NotificationType
  }

  export type NotificationType = string
}
