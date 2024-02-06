import { Account } from './account'
import { Status } from './status'

export type Notification = {
  account: Account
  created_at: string
  id: string
  status?: Status
  emoji?: string
  emoji_url?: string
  type: NotificationType
  target?: Account
}

export type NotificationType = string
