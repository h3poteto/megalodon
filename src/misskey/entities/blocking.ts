/// <reference path="userDetail.ts" />

namespace MisskeyEntity {
  export type Blocking = {
    id: string
    createdAt: string
    blockeeId: string
    blockee: UserDetail
  }
}
