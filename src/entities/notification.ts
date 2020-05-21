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

  export type NotificationType = 'mention' | 'reblog' | 'favourite' | 'follow' | 'poll' | 'emoji_reaction' | 'follow_request'
}
