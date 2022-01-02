/// <reference path="user.ts" />

namespace MisskeyEntity {
  export type Reaction = {
    id: string
    createdAt: string
    user: User
    type: string
  }
}
