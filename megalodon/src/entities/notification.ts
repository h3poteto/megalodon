import { Account } from './account.js'
import { Status } from './status.js'
import { Reaction } from './reaction.js'

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
