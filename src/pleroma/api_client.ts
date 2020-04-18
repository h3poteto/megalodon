import MastodonAPI from '../mastodon/api_client'
import MegalodonEntity from '../entity'
import PleromaEntity from './entity'

namespace PleromaAPI {
  export namespace Entity {
    export type Account = PleromaEntity.Account
    export type Application = PleromaEntity.Application
    export type Attachment = PleromaEntity.Attachment
    export type Card = PleromaEntity.Card
    export type Emoji = PleromaEntity.Emoji
    export type History = PleromaEntity.History
    export type Mention = PleromaEntity.Mention
    export type Notification = PleromaEntity.Notification
    export type Poll = PleromaEntity.Poll
    export type PollOption = PleromaEntity.PollOption
    export type Reaction = PleromaEntity.Reaction
    export type Source = PleromaEntity.Source
    export type Status = PleromaEntity.Status
    export type Tag = PleromaEntity.Tag

    export type Relationship = MastodonAPI.Entity.Relationship
  }

  export namespace Converter {
    export const decodeNotificationType = (
      t: 'mention' | 'reblog' | 'favourite' | 'follow' | 'poll' | 'pleroma:emoji_reaction'
    ): 'mention' | 'reblog' | 'favourite' | 'follow' | 'poll' | 'emoji_reaction' => {
      switch (t) {
        case 'pleroma:emoji_reaction':
          return 'emoji_reaction'
        default:
          return t
      }
    }
    export const encodeNotificationType = (
      t: 'mention' | 'reblog' | 'favourite' | 'follow' | 'poll' | 'emoji_reaction'
    ): 'mention' | 'reblog' | 'favourite' | 'follow' | 'poll' | 'pleroma:emoji_reaction' => {
      switch (t) {
        case 'emoji_reaction':
          return 'pleroma:emoji_reaction'
        default:
          return t
      }
    }

    export const account = (a: Entity.Account): MegalodonEntity.Account => a
    export const application = (a: Entity.Application): MegalodonEntity.Application => a
    export const attachment = (a: Entity.Attachment): MegalodonEntity.Attachment => a
    export const card = (c: Entity.Card): MegalodonEntity.Card => c
    export const emoji = (e: Entity.Emoji): MegalodonEntity.Emoji => e
    export const history = (h: Entity.History): MegalodonEntity.History => h
    export const mention = (m: Entity.Mention): MegalodonEntity.Mention => m
    export const notification = (n: Entity.Notification): MegalodonEntity.Notification => {
      if (n.status && n.emoji) {
        return {
          id: n.id,
          account: n.account,
          created_at: n.created_at,
          status: status(n.status),
          emoji: n.emoji,
          type: decodeNotificationType(n.type)
        }
      } else if (n.status) {
        return {
          id: n.id,
          account: n.account,
          created_at: n.created_at,
          status: status(n.status),
          type: decodeNotificationType(n.type)
        }
      } else {
        return {
          id: n.id,
          account: n.account,
          created_at: n.created_at,
          type: decodeNotificationType(n.type)
        }
      }
    }
    export const poll = (p: Entity.Poll): MegalodonEntity.Poll => p
    export const pollOption = (p: Entity.PollOption): MegalodonEntity.PollOption => p
    export const reaction = (r: Entity.Reaction): MegalodonEntity.Reaction => r
    export const status = (s: Entity.Status): MegalodonEntity.Status => ({
      id: s.id,
      uri: s.uri,
      url: s.url,
      account: account(s.account),
      in_reply_to_id: s.in_reply_to_id,
      in_reply_to_account_id: s.in_reply_to_account_id,
      reblog: s.reblog ? status(s.reblog) : null,
      content: s.content,
      created_at: s.created_at,
      emojis: s.emojis.map(e => emoji(e)),
      replies_count: s.replies_count,
      reblogs_count: s.reblogs_count,
      favourites_count: s.favourites_count,
      reblogged: s.reblogged,
      favourited: s.favourited,
      muted: s.muted,
      sensitive: s.sensitive,
      spoiler_text: s.spoiler_text,
      visibility: s.visibility,
      media_attachments: s.media_attachments.map(m => attachment(m)),
      mentions: s.mentions.map(m => mention(m)),
      tags: s.tags.map(t => tag(t)),
      card: s.card ? card(s.card) : null,
      poll: s.poll ? poll(s.poll) : null,
      application: s.application ? application(s.application) : null,
      language: s.language,
      pinned: s.pinned,
      emoji_reactions: s.pleroma.emoji_reactions.map(r => reaction(r))
    })
    export const tag = (t: Entity.Tag): MegalodonEntity.Tag => t

    export const relationship = (r: Entity.Relationship): MegalodonEntity.Relationship => r
  }
}

export default PleromaAPI
