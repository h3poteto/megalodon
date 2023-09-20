/// <reference path="user.ts" />

namespace FirefishEntity {
  export type FollowRequest = {
    id: string
    follower: User
    followee: User
  }
}
