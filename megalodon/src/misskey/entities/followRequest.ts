/// <reference path="user.ts" />

namespace MisskeyEntity {
  export type FollowRequest = {
    id: string
    follower: User
    followee: User
  }
}
