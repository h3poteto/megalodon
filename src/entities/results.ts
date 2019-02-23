import Account from './account'
import Status from './status'
import Tag from './tag'

export default interface Results {
  accounts: Account[],
  statuses: Status[],
  hashtags: Tag[]
}
