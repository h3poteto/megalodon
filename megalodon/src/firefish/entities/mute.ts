/// <reference path="userDetail.ts" />
/// <reference path="userDetailMe.ts" />

namespace FirefishEntity {
  export type Mute = {
    id: string
    createdAt: string
    muteeId: string
    mutee: UserDetail
  }
}
