import { Account } from './account.js'
import { Status } from './status.js'
import { Tag } from './tag.js'

export type Results = {
  accounts: Array<Account>
  statuses: Array<Status>
  hashtags: Array<Tag>
}
