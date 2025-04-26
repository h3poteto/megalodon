import { UserDetail } from './userDetail.js'

export type Mute = {
  id: string
  createdAt: string
  muteeId: string
  mutee: UserDetail
}
