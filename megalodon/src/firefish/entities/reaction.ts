import { User } from './user'

export type Reaction = {
  id: string
  createdAt: string
  user: User
  type: string
}
