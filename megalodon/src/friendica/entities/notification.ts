import { Account } from './account.js'
import { Status } from './status.js'

export type Notification = {
  account: Account
  created_at: string
  id: string
  status?: Status
  type: NotificationType
}

export type NotificationType = string
