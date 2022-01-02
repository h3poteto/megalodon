/// <reference path="emoji.ts" />

namespace MisskeyEntity {
  export type User = {
    id: string
    name: string
    username: string
    host: string | null
    avatarUrl: string
    avatarColor: string
    emojis: Array<Emoji>
  }
}
