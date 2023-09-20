/// <reference path="user.ts" />

namespace FirefishEntity {
  export type Reaction = {
    id: string
    createdAt: string
    user: User
    type: string
  }
}
