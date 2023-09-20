/// <reference path="userDetail.ts" />

namespace FirefishEntity {
  export type Mute = {
    id: string
    createdAt: string
    muteeId: string
    mutee: UserDetail
  }
}
