import { UserDetail } from './userDetail'

export type Mute = {
  id: string
  createdAt: string
  muteeId: string
  mutee: UserDetail
}
