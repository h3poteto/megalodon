/// <reference path="userDetail.ts" />

namespace MisskeyEntity {
  export type Follower = {
    id: string
    createdAt: string
    followeeId: string
    followerId: string
    follower: UserDetail
  }
}
