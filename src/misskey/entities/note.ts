/// <reference path="user.ts" />
/// <reference path="emoji.ts" />
/// <reference path="file.ts" />

namespace MisskeyEntity {
  export type Note = {
    id: string
    createdAt: string
    text: string
    cw: string | null
    userId: string
    user: User
    replyId: string | null
    renoteId: string | null
    renote?: Note
    repliesCount: number
    renoteCount: number
    viaMobile: boolean
    visibility: 'public' | 'home' | 'followers' | 'direct'
    reactions: { [key: string]: number }
    tags: Array<string>
    emojis: Array<Emoji>
    fileIds: Array<string>
    files: Array<File>
  }
}
