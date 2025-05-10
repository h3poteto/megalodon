import { Account } from './account.js'
import { Status } from './status.js'

export type Conversation = {
  id: string
  accounts: Array<Account>
  last_status: Status | null
  unread: boolean
}
