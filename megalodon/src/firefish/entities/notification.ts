import { User } from './user.js'
import { Note } from './note.js'

export type Notification = {
  id: string
  createdAt: string
  type: NotificationType
  userId?: string | null
  user?: User
  note?: Note
  reaction?: string | null
}

export type NotificationType = string
