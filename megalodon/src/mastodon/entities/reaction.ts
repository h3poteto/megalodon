// Fedibird Only Support

namespace MastodonEntity {
    export type Reaction = ReactionEmoji | ReactionCustomEmoji
}

type ReactionEmoji = {
    name: string
    count: number
    me: boolean
    account_ids?: Array<string>
}

type ReactionCustomEmoji = {
    domain: string
    static_url: string
    url: string
    width?: number
    height?: number
} & ReactionEmoji
  