import { Account } from './account'

export type Reaction = {
  count: number
  me: boolean
  name: string
  url?: string
  static_url?: string
  accounts?: Array<Account>
  account_ids?: Array<string>
}
