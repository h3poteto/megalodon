/// <reference path="emoji.ts" />
/// <reference path="note.ts" />

namespace FirefishEntity {
  export type UserDetail = {
    id: string
    name: string | null
    username: string
    host: string | null
    avatarUrl: string | null
    avatarBlurhash: string | null
    avatarColor: string | null
    isAdmin?: boolean
    isModerator?: boolean
    isBot?: boolean
    isCat?: boolean
    isIndexable?: boolean
    speakAsCat?: boolean
    emojis: Array<Emoji>
    url: string | null
    uri: string | null
    movedToUri: string | null
    createdAt: string
    updatedAt: string | null
    bannerUrl: string | null
    bannerBlurhash: string | null
    bannerColor: string | null
    isLocked: boolean
    isSilenced: boolean
    isSuspended: boolean
    description: string | null
    lang: string | null
    followersCount: number
    followingCount: number
    notesCount: number
    pinnedNoteIds: Array<string>
    pinnedNotes: Array<Note>
    isFollowing?: boolean
    isFollowed?: boolean
    hasPendingFollowRequestFromYou?: boolean
    hasPendintFollowRequestToYou?: boolean
    isBlocking?: boolean
    isBlocked?: boolean
    isMuted?: boolean
    isRenoteMuted?: boolean
  }
}
