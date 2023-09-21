/// <reference path="userDetail.ts" />

namespace FirefishEntity {
  export type Blocking = {
    id: string
    createdAt: string
    blockeeId: string
    blockee: UserDetail
  }
}
