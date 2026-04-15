import { User } from './user.js'

export type Reaction = {
  id: string
  createdAt: string
  user: User
  type: string
}
