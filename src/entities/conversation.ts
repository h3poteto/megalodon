import Account from './account'
import Status from './status'

export default interface Conversation {
  id: number
  accounts: Array<Account>
  last_status: Status | null
  unread: boolean
}
