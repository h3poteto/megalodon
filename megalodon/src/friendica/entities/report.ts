/// <reference path="account.ts" />

namespace FriendicaEntity {
  export type Report = {
    id: string
    action_taken: boolean
    category: Category
    comment: string
    forwarded: boolean
    status_ids: Array<string> | null
    rule_ids: Array<string> | null
    target_account: Account
  }

  export type Category = 'spam' | 'violation' | 'other'
}
