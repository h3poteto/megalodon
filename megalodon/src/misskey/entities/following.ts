/// <reference path="userDetail.ts" />

namespace MisskeyEntity {
  export type Following = {
    id: string
    createdAt: string
    followeeId: string
    followerId: string
    followee: UserDetail
  }
}
