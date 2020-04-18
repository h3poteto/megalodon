import MegalodonEntity from '../entity'
import PleromaEntity from './entity'

namespace PleromaAPI {
  export namespace Entity {
    export type Account = PleromaEntity.Account
    export type Activity = PleromaEntity.Activity
    export type Application = PleromaEntity.Application
    export type Attachment = PleromaEntity.Attachment
    export type Card = PleromaEntity.Card
    export type Context = PleromaEntity.Context
    export type Conversation = PleromaEntity.Conversation
    export type Emoji = PleromaEntity.Emoji
    export type FeaturedTag = PleromaEntity.FeaturedTag
    export type Field = PleromaEntity.Field
    export type Filter = PleromaEntity.Filter
    export type History = PleromaEntity.History
    export type IdentityProof = PleromaEntity.IdentityProof
    export type Instance = PleromaEntity.Instance
    export type List = PleromaEntity.List
    export type Marker = PleromaEntity.Marker
    export type Mention = PleromaEntity.Mention
    export type Notification = PleromaEntity.Notification
    export type Poll = PleromaEntity.Poll
    export type PollOption = PleromaEntity.PollOption
    export type Preferences = PleromaEntity.Preferences
    export type PushSubscription = PleromaEntity.PushSubscription
    export type Reaction = PleromaEntity.Reaction
    export type Relationship = PleromaEntity.Relationship
    export type Report = PleromaEntity.Report
    export type Results = PleromaEntity.Results
    export type ScheduledStatus = PleromaEntity.ScheduledStatus
    export type Source = PleromaEntity.Source
    export type Stats = PleromaEntity.Stats
    export type Status = PleromaEntity.Status
    export type StatusParams = PleromaEntity.StatusParams
    export type Tag = PleromaEntity.Tag
    export type Token = PleromaEntity.Token
    export type URLs = PleromaEntity.URLs
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
    export const activity = (a: Entity.Activity): MegalodonEntity.Activity => a
    export const application = (a: Entity.Application): MegalodonEntity.Application => a
    export const attachment = (a: Entity.Attachment): MegalodonEntity.Attachment => a
    export const card = (c: Entity.Card): MegalodonEntity.Card => c
    export const context = (c: Entity.Context): MegalodonEntity.Context => ({
      ancestors: c.ancestors.map(a => status(a)),
      descendants: c.descendants.map(d => status(d))
    })
    export const conversation = (c: Entity.Conversation): MegalodonEntity.Conversation => ({
      id: c.id,
      accounts: c.accounts.map(a => account(a)),
      last_status: c.last_status ? status(c.last_status) : null,
      unread: c.unread
    })
    export const emoji = (e: Entity.Emoji): MegalodonEntity.Emoji => e
    export const featured_tag = (f: Entity.FeaturedTag): MegalodonEntity.FeaturedTag => f
    export const field = (f: Entity.Field): MegalodonEntity.Field => f
    export const filter = (f: Entity.Filter): MegalodonEntity.Filter => f
    export const history = (h: Entity.History): MegalodonEntity.History => h
    export const identity_proof = (i: Entity.IdentityProof): MegalodonEntity.IdentityProof => i
    export const instance = (i: Entity.Instance): MegalodonEntity.Instance => i
    export const list = (l: Entity.List): MegalodonEntity.List => l
    export const marker = (m: Entity.Marker): MegalodonEntity.Marker => m
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
    export const preferences = (p: Entity.Preferences): MegalodonEntity.Preferences => p
    export const push_subscription = (p: Entity.PushSubscription): MegalodonEntity.PushSubscription => p
    export const reaction = (r: Entity.Reaction): MegalodonEntity.Reaction => r
    export const relationship = (r: Entity.Relationship): MegalodonEntity.Relationship => r
    export const report = (r: Entity.Report): MegalodonEntity.Report => r
    export const results = (r: Entity.Results): MegalodonEntity.Results => ({
      accounts: r.accounts.map(a => account(a)),
      statuses: r.statuses.map(s => status(s)),
      hashtags: r.hashtags.map(h => tag(h))
    })
    export const scheduled_status = (s: Entity.ScheduledStatus): MegalodonEntity.ScheduledStatus => ({
      id: s.id,
      scheduled_at: s.scheduled_at,
      params: s.params,
      media_attachments: s.media_attachments.map(m => attachment(m))
    })
    export const source = (s: Entity.Source): MegalodonEntity.Source => s
    export const stats = (s: Entity.Stats): MegalodonEntity.Stats => s
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
    export const status_params = (s: Entity.StatusParams): MegalodonEntity.StatusParams => s
    export const tag = (t: Entity.Tag): MegalodonEntity.Tag => t
    export const token = (t: Entity.Token): MegalodonEntity.Token => t
    export const urls = (u: Entity.URLs): MegalodonEntity.URLs => u
  }
}

export default PleromaAPI
