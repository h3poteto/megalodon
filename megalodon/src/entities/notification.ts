import { Account } from './account'
import { Status } from './status'
import { Reaction } from './reaction'

export type Notification = {
  account: Account | null
  created_at: string
  id: string
  status?: Status
  reaction?: Reaction
  type: NotificationType
  target?: Account
}

export type NotificationType = string
