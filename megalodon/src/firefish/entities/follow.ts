import { UserDetail } from './userDetail'

export type Follow = {
  id: string
  createdAt: string
  followeeId: string
  followerId: string
  follower: UserDetail
  followee: UserDetail
}
