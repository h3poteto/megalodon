import { UserDetail } from './userDetail.js'

export type Blocking = {
  id: string
  createdAt: string
  blockeeId: string
  blockee: UserDetail
}
