/// <reference path="account.ts" />
/// <reference path="status.ts" />

namespace Entity {
  export type Notification = {
    account: Account
    created_at: string
    id: string
    status: Status | null
    type: 'mention' | 'reblog' | 'favourite' | 'follow'
  }
}
