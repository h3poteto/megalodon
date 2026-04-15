import axios, { AxiosResponse, AxiosRequestConfig, AxiosInstance } from 'axios'
import dayjs from 'dayjs'
import FormData from 'form-data'

import { DEFAULT_UA } from '../default.js'
import Response from '../response.js'
import SharkeyEntity from './entity.js'
import MegalodonEntity from '../entity.js'
import WebSocket from './web_socket.js'
import SharkeyNotificationType from './notification.js'
import NotificationType, { UnknownNotificationTypeError } from '../notification.js'

namespace SharkeyAPI {
  export namespace Entity {
    export type Announcement = SharkeyEntity.Announcement
    export type App = SharkeyEntity.App
    export type Blocking = SharkeyEntity.Blocking
    export type Choice = SharkeyEntity.Choice
    export type CreatedNote = SharkeyEntity.CreatedNote
    export type CustomEmoji = SharkeyEntity.CustomEmoji
    export type CustomEmojiResponse = SharkeyEntity.CustomEmojiResponse
    export type Emoji = SharkeyEntity.Emoji
    export type Favorite = SharkeyEntity.Favorite
    export type File = SharkeyEntity.File
    export type Follow = SharkeyEntity.Follow
    export type FollowRequest = SharkeyEntity.FollowRequest
    export type Hashtag = SharkeyEntity.Hashtag
    export type List = SharkeyEntity.List
    export type Mute = SharkeyEntity.Mute
    export type Note = SharkeyEntity.Note
    export type NoteVisibility = SharkeyEntity.NoteVisibility
    export type Notification = SharkeyEntity.Notification
    export type Poll = SharkeyEntity.Poll
    export type Reaction = SharkeyEntity.Reaction
    export type Relation = SharkeyEntity.Relation
    export type User = SharkeyEntity.User
    export type UserDetail = SharkeyEntity.UserDetail
    export type UserDetailMe = SharkeyEntity.UserDetailMe
    export type Session = SharkeyEntity.Session
    export type Stats = SharkeyEntity.Stats
    export type Instance = SharkeyEntity.Instance
    export type Field = SharkeyEntity.Field
  }

  export namespace Converter {
    export const announcement = (a: Entity.Announcement): MegalodonEntity.Announcement => ({
      id: a.id,
      content: a.title + '\n' + a.text,
      starts_at: null,
      ends_at: null,
      published: true,
      all_day: true,
      published_at: a.createdAt,
      updated_at: a.updatedAt,
      read: a.isRead !== undefined ? a.isRead : null,
      mentions: [],
      statuses: [],
      tags: [],
      emojis: [],
      reactions: []
    })

    export const emojis = (e: Entity.Emoji): Array<MegalodonEntity.Emoji> => {
      if (!e) return []
      return Object.entries(e).map(([name, url]) => ({
        shortcode: name,
        static_url: url,
        url: url,
        visible_in_picker: true
      }))
    }

    export const customEmoji = (e: Entity.CustomEmoji): MegalodonEntity.Emoji => {
      return {
        shortcode: e.name,
        static_url: e.url,
        url: e.url,
        visible_in_picker: true,
        category: e.category ? e.category : undefined
      }
    }

    export const user = (u: Entity.User): MegalodonEntity.Account => {
      let acct = u.username
      if (u.host) {
        acct = `${u.username}@${u.host}`
      }
      return {
        id: u.id,
        username: u.username,
        acct: acct,
        display_name: u.name ? u.name : '',
        locked: false,
        group: null,
        noindex: u.isIndexable !== undefined ? u.isIndexable : null,
        suspended: null,
        limited: null,
        created_at: new Date().toISOString(),
        followers_count: 0,
        following_count: 0,
        statuses_count: 0,
        note: '',
        url: acct,
        avatar: u.avatarUrl ?? '',
        avatar_static: '',
        header: '',
        header_static: '',
        emojis: emojis(u.emojis ?? {}),
        moved: null,
        fields: [],
        bot: null
      }
    }

    export const userDetail = (u: Entity.UserDetail): MegalodonEntity.Account => {
      let acct = u.username
      if (u.host) {
        acct = `${u.username}@${u.host}`
      }
      return {
        id: u.id,
        username: u.username,
        acct: acct,
        display_name: u.name ?? '',
        locked: u.isLocked,
        group: null,
        noindex: u.isIndexable !== undefined ? u.isIndexable : null,
        suspended: u.isSuspended,
        limited: u.isSilenced,
        created_at: u.createdAt,
        followers_count: u.followersCount,
        following_count: u.followingCount,
        statuses_count: u.notesCount,
        note: u.description ?? '',
        url: acct,
        avatar: u.avatarUrl ?? '',
        avatar_static: '',
        header: u.bannerUrl ?? '',
        header_static: '',
        emojis: emojis(u.emojis ?? {}),
        moved: null,
        fields: u.fields.map(f => field(f)),
        bot: u.isBot !== undefined ? u.isBot : null,
        source: {
          privacy: null,
          sensitive: null,
          language: u.lang,
          note: u.description ?? '',
          fields: []
        }
      }
    }

    export const userDetailMe = (u: Entity.UserDetailMe): MegalodonEntity.Account => {
      const account = userDetail(u)

      return Object.assign({}, account, {
        source: {
          privacy: null,
          sensitive: u.alwaysMarkNsfw,
          language: u.lang,
          note: u.description ?? '',
          fields: []
        }
      })
    }

    export const userPreferences = (
      u: SharkeyAPI.Entity.UserDetailMe,
      v: MegalodonEntity.StatusVisibility
    ): MegalodonEntity.Preferences => {
      return {
        'reading:expand:media': 'default',
        'reading:expand:spoilers': false,
        'posting:default:language': u.lang,
        'posting:default:sensitive': u.alwaysMarkNsfw,
        'posting:default:visibility': v
      }
    }

    export const visibility = (v: SharkeyAPI.Entity.NoteVisibility): MegalodonEntity.StatusVisibility => {
      switch (v) {
        case 'public':
          return v
        case 'home':
          return 'unlisted'
        case 'followers':
          return 'private'
        case 'specified':
          return 'direct'
        case 'hidden':
          return 'local'
        default:
          return 'public'
      }
    }

    export const encodeVisibility = (v: MegalodonEntity.StatusVisibility): SharkeyAPI.Entity.NoteVisibility => {
      switch (v) {
        case 'public':
          return v
        case 'unlisted':
          return 'home'
        case 'private':
          return 'followers'
        case 'direct':
          return 'specified'
        case 'local':
          return 'hidden'
      }
    }

    export const fileType = (s: string): 'unknown' | 'image' | 'gifv' | 'video' | 'audio' => {
      if (s === 'image/gif') {
        return 'gifv'
      }
      if (s.includes('image')) {
        return 'image'
      }
      if (s.includes('video')) {
        return 'video'
      }
      if (s.includes('audio')) {
        return 'audio'
      }
      return 'unknown'
    }

    export const file = (f: Entity.File): MegalodonEntity.Attachment => {
      return {
        id: f.id,
        type: fileType(f.type),
        url: f.url ? f.url : '',
        remote_url: f.url,
        preview_url: f.thumbnailUrl,
        text_url: f.url,
        meta: {
          width: f.properties.width,
          height: f.properties.height
        },
        description: f.comment,
        blurhash: f.blurhash
      }
    }

    export const follower = (f: Entity.Follow): MegalodonEntity.Account => {
      return user(f.follower)
    }

    export const following = (f: Entity.Follow): MegalodonEntity.Account => {
      return user(f.followee)
    }

    export const relation = (r: Entity.Relation): MegalodonEntity.Relationship => {
      return {
        id: r.id,
        following: r.isFollowing,
        followed_by: r.isFollowed,
        blocking: r.isBlocking,
        blocked_by: r.isBlocked,
        muting: r.isMuted,
        muting_notifications: false,
        requested: r.hasPendingFollowRequestFromYou,
        domain_blocking: false,
        showing_reblogs: true,
        endorsed: false,
        notifying: false,
        note: null
      }
    }

    export const choice = (c: Entity.Choice): MegalodonEntity.PollOption => {
      return {
        title: c.text,
        votes_count: c.votes
      }
    }

    export const poll = (p: Entity.Poll): MegalodonEntity.Poll => {
      const now = dayjs()
      const expire = dayjs(p.expiresAt)
      const count = p.choices.reduce((sum, choice) => sum + choice.votes, 0)
      return {
        id: '',
        expires_at: p.expiresAt,
        expired: now.isAfter(expire),
        multiple: p.multiple,
        votes_count: count,
        options: Array.isArray(p.choices) ? p.choices.map(c => choice(c)) : [],
        voted: Array.isArray(p.choices) ? p.choices.some(c => c.isVoted) : false
      }
    }

    export const note = (n: Entity.Note): MegalodonEntity.Status => {
      return {
        id: n.id,
        uri: n.uri ? n.uri : '',
        url: n.uri ? n.uri : '',
        account: user(n.user),
        in_reply_to_id: n.replyId ? n.replyId : null,
        in_reply_to_account_id: n.reply?.userId ?? null,
        reblog: n.renote ? note(n.renote) : null,
        content: n.text
          ? n.text
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;')
              .replace(/`/g, '&#x60;')
              .replace(/\r?\n/g, '<br>')
          : '',
        plain_content: n.text ? n.text : null,
        created_at: n.createdAt,
        edited_at: null,
        emojis: emojis(n.emojis ?? {}),
        replies_count: n.repliesCount,
        reblogs_count: n.renoteCount,
        favourites_count: 0,
        reblogged: false,
        favourited: !!n.myReaction,
        muted: false,
        sensitive: Array.isArray(n.files) ? n.files.some(f => f.isSensitive) : false,
        spoiler_text: n.cw ? n.cw : '',
        visibility: visibility(n.visibility),
        media_attachments: Array.isArray(n.files) ? n.files.map(f => file(f)) : [],
        mentions: [],
        tags: [],
        card: null,
        poll: n.poll ? poll(n.poll) : null,
        application: null,
        language: null,
        pinned: null,
        emoji_reactions: mapReactions(n.reactionEmojis ?? {}, n.reactions, n.myReaction),
        bookmarked: false,
        quote: quote(n),
        quote_approval: {
          automatic: ['unsupported_policy'],
          manual: [],
          current_user: 'automatic'
        }
      }
    }

    export const quote = (n: Entity.Note): MegalodonEntity.QuotedStatus | null => {
      if (n.renote !== undefined && n.text !== null) {
        return {
          state: 'accepted',
          quoted_status: note(n.renote)
        }
      } else {
        return null
      }
    }

    export const mapReactions = (
      reactionEmojis: { [key: string]: string },
      r: { [key: string]: number },
      myReaction?: string | null
    ): Array<MegalodonEntity.Reaction> => {
      return Object.keys(r).map(key => {
        // Strip colons from custom emoji reaction names to match emoji shortcodes.
        const shortcode = key.replace(/:/g, '')
        // If this is a custom emoji (vs. a Unicode emoji), find its image URL.
        const url = reactionEmojis[shortcode]
        // Finally, remove trailing @. from local custom emoji reaction names.
        const name = shortcode.replace('@.', '')

        return {
          count: r[key],
          me: key === myReaction,
          name,
          url,
          // We don't actually have a static version of the asset, but clients expect one anyway.
          static_url: url
        }
      })
    }

    export const reactions = (r: Array<Entity.Reaction>): Array<MegalodonEntity.Reaction> => {
      const result: Array<MegalodonEntity.Reaction> = []
      r.map(e => {
        const i = result.findIndex(res => res.name === e.type)
        if (i >= 0) {
          result[i].count++
        } else {
          result.push({
            count: 1,
            me: false,
            name: e.type
          })
        }
      })
      return result
    }

    export const noteToConversation = (n: Entity.Note): MegalodonEntity.Conversation => {
      const accounts: Array<MegalodonEntity.Account> = [user(n.user)]
      if (n.reply) {
        accounts.push(user(n.reply.user))
      }
      return {
        id: n.id,
        accounts: accounts,
        last_status: note(n),
        unread: false
      }
    }

    export const list = (l: Entity.List): MegalodonEntity.List => ({
      id: l.id,
      title: l.name,
      replies_policy: null
    })

    export const encodeNotificationType = (
      e: MegalodonEntity.NotificationType
    ): SharkeyEntity.NotificationType | UnknownNotificationTypeError => {
      switch (e) {
        case NotificationType.Follow:
          return SharkeyNotificationType.Follow
        case NotificationType.Mention:
          return SharkeyNotificationType.Reply
        case NotificationType.Favourite:
        case NotificationType.Reaction:
          return SharkeyNotificationType.Reaction
        case NotificationType.Reblog:
          return SharkeyNotificationType.Renote
        case NotificationType.Quote:
          return SharkeyNotificationType.Quote
        case NotificationType.PollExpired:
          return SharkeyNotificationType.PollEnded
        case NotificationType.FollowRequest:
          return SharkeyNotificationType.ReceiveFollowRequest
        case NotificationType.Status:
          return SharkeyNotificationType.Note
        case NotificationType.Update:
          return SharkeyNotificationType.Edited
        default:
          return new UnknownNotificationTypeError()
      }
    }

    export const decodeNotificationType = (
      e: SharkeyEntity.NotificationType
    ): MegalodonEntity.NotificationType | UnknownNotificationTypeError => {
      switch (e) {
        case SharkeyNotificationType.Follow:
          return NotificationType.Follow
        case SharkeyNotificationType.Mention:
        case SharkeyNotificationType.Reply:
          return NotificationType.Mention
        case SharkeyNotificationType.Renote:
          return NotificationType.Reblog
        case SharkeyNotificationType.Quote:
          return NotificationType.Quote
        case SharkeyNotificationType.Reaction:
          return NotificationType.Reaction
        case SharkeyNotificationType.PollEnded:
          return NotificationType.PollExpired
        case SharkeyNotificationType.ReceiveFollowRequest:
          return NotificationType.FollowRequest
        case SharkeyNotificationType.FollowRequestAccepted:
          return NotificationType.Follow
        case SharkeyNotificationType.Note:
          return NotificationType.Status
        case SharkeyNotificationType.Edited:
          return NotificationType.Update
        default:
          return new UnknownNotificationTypeError()
      }
    }

    export const notification = (n: Entity.Notification): MegalodonEntity.Notification | UnknownNotificationTypeError => {
      const notificationType = decodeNotificationType(n.type)
      if (notificationType instanceof UnknownNotificationTypeError) {
        return notificationType
      }
      let notification = {
        id: n.id,
        account: n.user ? user(n.user) : null,
        created_at: n.createdAt,
        type: notificationType
      }
      if (n.note) {
        notification = Object.assign(notification, {
          status: note(n.note)
        })
      }
      if (n.reaction) {
        const reactionList = mapReactions(n.note?.reactionEmojis ?? {}, { [n.reaction]: 1 })
        if (reactionList.length > 0) {
          notification = Object.assign(notification, {
            reaction: reactionList[0]
          })
        }
      }
      return notification
    }

    export const stats = (s: Entity.Stats): MegalodonEntity.Stats => {
      return {
        user_count: s.usersCount,
        status_count: s.notesCount,
        domain_count: s.instances
      }
    }

    export const instance = (i: Entity.Instance): MegalodonEntity.Instance => {
      return {
        uri: i.uri,
        title: i.title,
        description: i.description,
        email: i.email,
        version: i.version,
        thumbnail: i.thumbnail,
        urls: i.urls,
        stats: {
          user_count: i.stats.user_count,
          status_count: i.stats.status_count,
          domain_count: i.stats.domain_count
        },
        languages: i.languages,
        registrations: i.registrations,
        approval_required: i.approval_required,
        invites_enabled: i.invites_enabled,
        configuration: {
          statuses: {
            max_characters: i.configuration.statuses.max_characters,
            max_media_attachments: i.configuration.statuses.max_media_attachments,
            characters_reserved_per_url: i.configuration.statuses.characters_reserved_per_url
          },
          polls: {
            max_options: i.configuration.polls.max_options,
            max_characters_per_option: i.configuration.polls.max_characters_per_option,
            min_expiration: i.configuration.polls.min_expiration,
            max_expiration: i.configuration.polls.max_expiration
          }
        }
      }
    }

    const field = (f: Entity.Field): MegalodonEntity.Field => {
      return {
        name: f.name,
        value: f.value,
        verified: f.verified,
        verified_at: null
      }
    }

    export const hashtag = (h: Entity.Hashtag): MegalodonEntity.Tag => {
      return {
        name: h.tag,
        url: h.tag,
        history: [],
        following: false
      }
    }
  }

  export const DEFAULT_SCOPE = [
    'read:account',
    'write:account',
    'read:blocks',
    'write:blocks',
    'read:drive',
    'write:drive',
    'read:favorites',
    'write:favorites',
    'read:following',
    'write:following',
    'read:mutes',
    'write:mutes',
    'write:notes',
    'read:notifications',
    'write:notifications',
    'read:reactions',
    'write:reactions',
    'write:votes'
  ]

  /**
   * Interface
   */
  export interface Interface {
    get<T = any>(path: string, params?: any, headers?: { [key: string]: string }): Promise<Response<T>>
    post<T = any>(path: string, params?: any, headers?: { [key: string]: string }): Promise<Response<T>>
    cancel(): void
    socket(
      url: string,
      channel: 'user' | 'localTimeline' | 'hybridTimeline' | 'globalTimeline' | 'conversation' | 'list',
      listId?: string
    ): WebSocket
  }

  /**
   * Sharkey API client.
   *
   * Using axios for request, you will handle promises.
   */
  export class Client implements Interface {
    private accessToken: string | null
    private baseUrl: string
    private userAgent: string
    private abortController: AbortController
    private axios: AxiosInstance

    /**
     * @param baseUrl hostname or base URL
     * @param accessToken access token from OAuth2 authorization
     * @param userAgent UserAgent is specified in header on request.
     * @param axiosInstance Optional custom axios instance for custom adapters.
     */
    constructor(baseUrl: string, accessToken: string | null, userAgent: string = DEFAULT_UA, axiosInstance?: AxiosInstance) {
      this.accessToken = accessToken
      this.baseUrl = baseUrl
      this.userAgent = userAgent
      this.abortController = new AbortController()
      this.axios = axiosInstance || axios.create()
      // Set the signal only if not already configured by the user
      if (!this.axios.defaults.signal) {
        this.axios.defaults.signal = this.abortController.signal
      }
    }

    /**
     * GET request to sharkey API.
     **/
    public async get<T>(path: string, params: any = {}, headers: { [key: string]: string } = {}): Promise<Response<T>> {
      const options: AxiosRequestConfig = {
        params: params,
        headers: headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
      return this.axios.get<T>(this.baseUrl + path, options).then((resp: AxiosResponse<T>) => {
        const res: Response<T> = {
          data: resp.data,
          status: resp.status,
          statusText: resp.statusText,
          headers: resp.headers
        }
        return res
      })
    }

    /**
     * POST request to sharkey REST API.
     * @param path relative path from baseUrl
     * @param params Form data
     * @param headers Request header object
     */
    public async post<T>(path: string, params: any = {}, headers: { [key: string]: string } = {}): Promise<Response<T>> {
      const options: AxiosRequestConfig = {
        headers: headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
      let bodyParams = params
      if (this.accessToken) {
        if (params instanceof FormData) {
          bodyParams.append('i', this.accessToken)
        } else {
          bodyParams = Object.assign(params, {
            i: this.accessToken
          })
        }
      }
      return this.axios.post<T>(this.baseUrl + path, bodyParams, options).then((resp: AxiosResponse<T>) => {
        const res: Response<T> = {
          data: resp.data,
          status: resp.status,
          statusText: resp.statusText,
          headers: resp.headers
        }
        return res
      })
    }

    /**
     * Cancel all requests in this instance.
     * @returns void
     */
    public cancel(): void {
      return this.abortController.abort()
    }

    /**
     * Get connection and receive websocket connection for Sharkey API.
     *
     * @param url Streaming url.
     * @param channel Channel name is user, localTimeline, hybridTimeline, globalTimeline, conversation or list.
     * @param listId This parameter is required only list channel.
     */
    public socket(
      url: string,
      channel: 'user' | 'localTimeline' | 'hybridTimeline' | 'globalTimeline' | 'conversation' | 'list',
      listId?: string
    ): WebSocket {
      if (!this.accessToken) {
        throw new Error('accessToken is required')
      }
      const streaming = new WebSocket(url, channel, this.accessToken, listId, this.userAgent)

      streaming.start()
      return streaming
    }
  }
}

export default SharkeyAPI
