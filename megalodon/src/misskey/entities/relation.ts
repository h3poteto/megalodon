namespace MisskeyEntity {
  export type Relation = {
    id: string
    isFollowing: boolean
    hasPendingFollowRequestFromYou: boolean
    hasPendingFollowRequestToYou: boolean
    isFollowed: boolean
    isBlocking: boolean
    isBlocked: boolean
    isMuted: boolean
  }
}
