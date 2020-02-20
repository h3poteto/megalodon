/// <reference path="account.ts" />
/// <reference path="status.ts" />

namespace MastodonEntity {
  export type Conversation = {
    id: string
    accounts: Array<Account>
    last_status: Status | null
    unread: boolean
  }
}
