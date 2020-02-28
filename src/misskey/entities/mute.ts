/// <reference path="userDetail.ts" />

namespace MisskeyEntity {
  export type Mute = {
    id: string
    createdAt: string
    muteeId: string
    mutee: UserDetail
  }
}
