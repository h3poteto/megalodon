import { Account } from './account'

export type Reaction = {
  count: number
  me: boolean
  name: string
  accounts?: Array<Account>
  account_ids?: Array<string>
  url?: string
}
