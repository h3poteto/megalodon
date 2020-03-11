import axios, { AxiosResponse, CancelTokenSource, AxiosRequestConfig } from 'axios'
import moment from 'moment'
import { DEFAULT_UA } from '../default'
import proxyAgent, { ProxyConfig } from '../proxy_config'
import Response from '../response'
import MisskeyEntity from './entity'
import MegalodonEntity from '../entity'
import WebSocket from './web_socket'

namespace MisskeyAPI {
  export namespace Entity {
    export type App = MisskeyEntity.App
    export type Blocking = MisskeyEntity.Blocking
    export type Choice = MisskeyEntity.Choice
    export type CreatedNote = MisskeyEntity.CreatedNote
    export type Emoji = MisskeyEntity.Emoji
    export type Favorite = MisskeyEntity.Favorite
    export type File = MisskeyEntity.File
    export type Follower = MisskeyEntity.Follower
    export type Following = MisskeyEntity.Following
    export type FollowRequest = MisskeyEntity.FollowRequest
    export type Hashtag = MisskeyEntity.Hashtag
    export type List = MisskeyEntity.List
    export type Meta = MisskeyEntity.Meta
    export type Mute = MisskeyEntity.Mute
    export type Note = MisskeyEntity.Note
    export type Notification = MisskeyEntity.Notification
    export type Poll = MisskeyEntity.Poll
    export type Relation = MisskeyEntity.Relation
    export type User = MisskeyEntity.User
    export type UserDetail = MisskeyEntity.UserDetail
    export type UserKey = MisskeyEntity.UserKey
    export type Session = MisskeyEntity.Session
    export type Stats = MisskeyEntity.Stats
  }

  export namespace Converter {
    export const emoji = (e: Entity.Emoji): MegalodonEntity.Emoji => {
      return {
        shortcode: e.name,
        static_url: e.url,
        url: e.url,
        visible_in_picker: true
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
        display_name: u.name,
        locked: false,
        created_at: '',
        followers_count: 0,
        following_count: 0,
        statuses_count: 0,
        note: '',
        url: acct,
        avatar: u.avatarUrl,
        avatar_static: u.avatarColor,
        header: '',
        header_static: '',
        emojis: u.emojis.map(e => emoji(e)),
        moved: null,
        fields: null,
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
        display_name: u.name,
        locked: u.isLocked,
        created_at: u.createdAt,
        followers_count: u.followersCount,
        following_count: u.followingCount,
        statuses_count: u.notesCount,
        note: u.description,
        url: acct,
        avatar: u.avatarUrl,
        avatar_static: u.avatarColor,
        header: u.bannerUrl,
        header_static: u.bannerColor,
        emojis: u.emojis.map(e => emoji(e)),
        moved: null,
        fields: null,
        bot: u.isBot
      }
    }

    export const visibility = (v: 'public' | 'home' | 'followers' | 'specified'): 'public' | 'unlisted' | 'private' | 'direct' => {
      switch (v) {
        case 'public':
          return v
        case 'home':
          return 'unlisted'
        case 'followers':
          return 'private'
        case 'specified':
          return 'direct'
      }
    }

    export const encodeVisibility = (v: 'public' | 'unlisted' | 'private' | 'direct'): 'public' | 'home' | 'followers' | 'specified' => {
      switch (v) {
        case 'public':
          return v
        case 'unlisted':
          return 'home'
        case 'private':
          return 'followers'
        case 'direct':
          return 'specified'
      }
    }

    export const file = (f: Entity.File): MegalodonEntity.Attachment => {
      return {
        id: f.id,
        type: 'image',
        url: f.url,
        remote_url: f.url,
        preview_url: f.thumbnailUrl,
        text_url: f.url,
        meta: null,
        description: null
      }
    }

    export const follower = (f: Entity.Follower): MegalodonEntity.Account => {
      return user(f.follower)
    }

    export const following = (f: Entity.Following): MegalodonEntity.Account => {
      return user(f.followee)
    }

    export const relation = (r: Entity.Relation): MegalodonEntity.Relationship => {
      return {
        id: r.id,
        following: r.isFollowing,
        followed_by: r.isFollowed,
        blocking: r.isBlocking,
        muting: r.isMuted,
        muting_notifications: false,
        requested: r.hasPendingFollowRequestFromYou,
        domain_blocking: false,
        showing_reblogs: true,
        endorsed: false
      }
    }

    export const choice = (c: Entity.Choice): MegalodonEntity.PollOption => {
      return {
        title: c.text,
        votes_count: c.votes
      }
    }

    export const poll = (p: Entity.Poll): MegalodonEntity.Poll => {
      const now = moment()
      const expire = moment(p.expiresAt)
      const count = p.choices.reduce((sum, choice) => sum + choice.votes, 0)
      return {
        id: '',
        expires_at: p.expiresAt,
        expired: now.isAfter(expire),
        multiple: p.multiple,
        votes_count: count,
        options: p.choices.map(c => choice(c)),
        voted: p.choices.some(c => c.isVoted)
      }
    }

    export const note = (n: Entity.Note): MegalodonEntity.Status => {
      return {
        id: n.id,
        uri: n.uri ? n.uri : '',
        url: n.uri ? n.uri : '',
        account: user(n.user),
        in_reply_to_id: n.replyId,
        in_reply_to_account_id: null,
        reblog: n.renote ? note(n.renote) : null,
        content: n.text,
        created_at: n.createdAt,
        emojis: n.emojis.map(e => emoji(e)),
        replies_count: n.repliesCount,
        reblogs_count: n.renoteCount,
        favourites_count: 0,
        reblogged: false,
        favourited: false,
        muted: false,
        sensitive: n.files ? n.files.some(f => f.isSensitive) : false,
        spoiler_text: n.cw ? n.cw : '',
        visibility: visibility(n.visibility),
        media_attachments: n.files ? n.files.map(f => file(f)) : [],
        mentions: [],
        tags: [],
        card: null,
        poll: n.poll ? poll(n.poll) : null,
        application: null,
        language: null,
        pinned: null
      }
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
      title: l.name
    })

    export const encodeNotificationType = (
      e: 'follow' | 'favourite' | 'reblog' | 'mention' | 'poll'
    ): 'follow' | 'mention' | 'reply' | 'renote' | 'quote' | 'reaction' | 'pollVote' => {
      switch (e) {
        case 'follow':
          return e
        case 'mention':
          return 'reply'
        case 'favourite':
          return 'reaction'
        case 'reblog':
          return 'renote'
        case 'poll':
          return 'pollVote'
      }
    }

    export const decodeNotificationType = (
      e:
        | 'follow'
        | 'mention'
        | 'reply'
        | 'renote'
        | 'quote'
        | 'reaction'
        | 'pollVote'
        | 'receiveFollowRequest'
        | 'followRequestAccepted'
        | 'groupInvited'
    ): 'follow' | 'favourite' | 'reblog' | 'mention' | 'poll' => {
      switch (e) {
        case 'follow':
          return e
        case 'mention':
        case 'reply':
          return 'mention'
        case 'renote':
          return 'reblog'
        case 'reaction':
          return 'favourite'
        case 'pollVote':
          return 'poll'
        default:
          return 'follow'
      }
    }

    export const notification = (n: Entity.Notification): MegalodonEntity.Notification => {
      let notification = {
        id: n.id,
        account: user(n.user),
        created_at: n.createdAt,
        type: decodeNotificationType(n.type)
      }
      if (n.note) {
        notification = Object.assign(notification, {
          status: note(n.note)
        })
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

    export const meta = (m: Entity.Meta, s: Entity.Stats): MegalodonEntity.Instance => {
      const wss = m.uri.replace(/^https:\/\//, 'wss://')
      return {
        uri: m.uri,
        title: m.name,
        description: m.description,
        email: m.maintainerEmail,
        version: m.version,
        thumbnail: m.bannerUrl,
        urls: {
          streaming_api: `${wss}/streaming`
        },
        stats: stats(s),
        languages: m.langs,
        contact_account: null,
        max_toot_chars: m.maxNoteTextLength,
        registrations: !m.disableRegistration
      }
    }

    export const hashtag = (h: Entity.Hashtag): MegalodonEntity.Tag => {
      return {
        name: h.tag,
        url: h.tag,
        history: null
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
  export interface Interface {}

  /**
   * Misskey API client.
   *
   * Usign axios for request, you will handle promises.
   */
  export class Client implements Interface {
    static DEFAULT_URL = 'https://misskey.io'

    private accessToken: string | null
    private baseUrl: string
    private userAgent: string
    private cancelTokenSource: CancelTokenSource
    private proxyConfig: ProxyConfig | false = false

    /**
     * @param baseUrl hostname or base URL
     * @param accessToken access token from OAuth2 authorization
     * @param userAgent UserAgent is specified in header on request.
     * @param proxyConfig Proxy setting, or set false if don't use proxy.
     */
    constructor(baseUrl: string, accessToken: string | null, userAgent: string = DEFAULT_UA, proxyConfig: ProxyConfig | false = false) {
      this.accessToken = accessToken
      this.baseUrl = baseUrl
      this.userAgent = userAgent
      this.cancelTokenSource = axios.CancelToken.source()
      this.proxyConfig = proxyConfig
    }

    /**
     * Unauthorized POST request to mastodon REST API.
     * @param path relative path from baseUrl
     * @param params Body parameters
     * @param baseUrl base URL of the target
     * @param proxyConfig Proxy setting, or set false if don't use proxy.
     */
    public static async post<T>(
      path: string,
      params = {},
      baseUrl = this.DEFAULT_URL,
      proxyConfig: ProxyConfig | false = false
    ): Promise<Response<T>> {
      let options: AxiosRequestConfig = {}
      if (proxyConfig) {
        options = Object.assign(options, {
          httpsAgent: proxyAgent(proxyConfig)
        })
      }
      const apiUrl = baseUrl
      return axios.post<T>(apiUrl + path, params, options).then((resp: AxiosResponse<T>) => {
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
     * POST request to mastodon REST API.
     * @param path relative path from baseUrl
     * @param params Form data
     */
    public async post<T>(path: string, params = {}): Promise<Response<T>> {
      let options: AxiosRequestConfig = {
        cancelToken: this.cancelTokenSource.token,
        headers: {
          'User-Agent': this.userAgent
        }
      }
      if (this.proxyConfig) {
        options = Object.assign(options, {
          httpsAgent: proxyAgent(this.proxyConfig)
        })
      }
      let bodyParams = {}
      if (this.accessToken) {
        bodyParams = Object.assign(params, {
          i: this.accessToken
        })
      }
      return axios.post<T>(this.baseUrl + path, bodyParams, options).then((resp: AxiosResponse<T>) => {
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
      return this.cancelTokenSource.cancel('Request is canceled by user')
    }

    public socket(
      channel: 'user' | 'localTimeline' | 'hybridTimeline' | 'globalTimeline' | 'conversation' | 'list',
      listId?: string | null
    ): WebSocket {
      if (!this.accessToken) {
        throw new Error('accessToken is required')
      }
      const url = this.baseUrl + '/streaming'
      const streaming = new WebSocket(url, channel, this.accessToken, listId)
      process.nextTick(() => {
        streaming.start()
      })
      return streaming
    }
  }
}

export default MisskeyAPI
