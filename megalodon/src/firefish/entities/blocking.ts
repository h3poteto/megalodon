/// <reference path="userDetail.ts" />
/// <reference path="userDetailMe.ts" />

namespace FirefishEntity {
  export type Blocking = {
    id: string
    createdAt: string
    blockeeId: string
    blockee: UserDetail
  }
}
