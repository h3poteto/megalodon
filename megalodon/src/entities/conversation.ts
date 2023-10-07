import { Account } from './account'
import { Status } from './status'

export type Conversation = {
  id: string
  accounts: Array<Account>
  last_status: Status | null
  unread: boolean
}
