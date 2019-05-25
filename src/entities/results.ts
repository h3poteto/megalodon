import Account from './account'
import Status from './status'
import Tag from './tag'

export default interface Results {
  accounts: Array<Account>
  statuses: Array<Status>
  hashtags: Array<Tag>
}
