import { UserDetail } from './userDetail'

export type Blocking = {
  id: string
  createdAt: string
  blockeeId: string
  blockee: UserDetail
}
