import axios, { AxiosResponse, CancelTokenSource, AxiosRequestConfig } from 'axios'
import { DEFAULT_UA } from '@/default'
import proxyAgent, { ProxyConfig } from '@/proxy_config'
import Response from '@/response'
import MisskeyEntity from './entity'
import MegalodonEntity from '@/entity'

namespace MisskeyAPI {
  export namespace Entity {
    export type App = MisskeyEntity.App
    export type Emoji = MisskeyEntity.Emoji
    export type File = MisskeyEntity.File
    export type Follower = MisskeyEntity.Follower
    export type Following = MisskeyEntity.Following
    export type Note = MisskeyEntity.Note
    export type Relation = MisskeyEntity.Relation
    export type User = MisskeyEntity.User
    export type UserDetail = MisskeyEntity.UserDetail
    export type UserKey = MisskeyEntity.UserKey
    export type Session = MisskeyEntity.Session
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
        url: '',
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

    export const visibility = (v: 'public' | 'home' | 'followers' | 'direct'): 'public' | 'unlisted' | 'private' | 'direct' => {
      switch (v) {
        case 'public':
        case 'direct':
          return v
        case 'home':
          return 'unlisted'
        case 'followers':
          return 'private'
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

    export const note = (n: Entity.Note): MegalodonEntity.Status => {
      return {
        id: n.id,
        uri: '',
        url: '',
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
        spoiler_text: '',
        visibility: visibility(n.visibility),
        media_attachments: n.files ? n.files.map(f => file(f)) : [],
        mentions: [],
        tags: [],
        card: null,
        poll: null,
        application: null,
        language: null,
        pinned: null
      }
    }
  }

  export const DEFAULT_SCOPE = [
    'read:account',
    'write:account',
    'read:blocks',
    'write:blocks',
    'read:favourites',
    'write:favourites',
    'read:following',
    'write:following',
    'read:messaging',
    'write:messaging',
    'read:mute',
    'write:mute',
    'write:note',
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

    private accessToken: string
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
    constructor(baseUrl: string, accessToken: string, userAgent: string = DEFAULT_UA, proxyConfig: ProxyConfig | false = false) {
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
      const bodyParams = Object.assign(params, {
        i: this.accessToken
      })
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
  }
}

export default MisskeyAPI
