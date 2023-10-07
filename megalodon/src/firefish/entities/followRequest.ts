import { User } from './user'

export type FollowRequest = {
  id: string
  follower: User
  followee: User
}
