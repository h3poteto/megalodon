import Account from './account'
import Status from './status'

export default interface Notification {
  account: Account,
  created_at: string,
  id: number,
  status: Status | null,
  type: 'mention' | 'reblog' | 'favourite' | 'follow'
}
