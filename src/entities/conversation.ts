import Account from './account'
import Status from './status'

export default interface Conversation {
  id: string
  accounts: Array<Account>
  last_status: Status | null
  unread: boolean
}
