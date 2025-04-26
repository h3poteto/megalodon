import { Account } from './account.js'
import { Status } from './status.js'

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
