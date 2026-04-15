import { User } from './user.js'

export type FollowRequest = {
  id: string
  follower: User
  followee: User
}
