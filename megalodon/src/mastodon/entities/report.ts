/// <reference path="account.ts" />

namespace MastodonEntity {
  export type Report = {
    id: string
    action_taken: boolean
    action_taken_at: string | null
    category: Category
    comment: string
    forwarded: boolean
    status_ids: Array<string> | null
    rule_ids: Array<string> | null
    target_account: Account
  }

  export type Category = 'spam' | 'violation' | 'other'
}
