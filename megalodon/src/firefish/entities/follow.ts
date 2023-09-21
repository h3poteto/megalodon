/// <reference path="userDetail.ts" />

namespace FirefishEntity {
  export type Follow = {
    id: string
    createdAt: string
    followeeId: string
    followerId: string
    follower: UserDetail
    followee: UserDetail
  }
}
