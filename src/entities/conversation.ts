import Account from './account'
import Status from './status'

export default interface Conversation {
  id: number,
  accounts: Account[],
  last_status: Status,
  unread: boolean
}
