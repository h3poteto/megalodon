/// <reference path="account.ts" />
/// <reference path="status.ts" />

namespace PleromaEntity {
  export type Notification = {
    account: Account
    created_at: string
    id: string
    status?: Status
    emoji?: string
    type: 'mention' | 'reblog' | 'favourite' | 'follow' | 'poll' | 'pleroma:emoji_reaction'
  }
}
