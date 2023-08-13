import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import objectAssignDeep from 'object-assign-deep'

import WebSocket from './web_socket'
import Response from '../response'
import { RequestCanceledError } from '../cancel'
import proxyAgent, { ProxyConfig } from '../proxy_config'
import { NO_REDIRECT, DEFAULT_SCOPE, DEFAULT_UA } from '../default'
import FriendicaEntity from './entity'
import MegalodonEntity from '../entity'
import NotificationType, { UnknownNotificationTypeError } from '../notification'
import FriendicaNotificationType from './notification'

namespace FriendicaAPI {
  /**
   * Interface
   */
  export interface Interface {
    get<T = any>(path: string, params?: any, headers?: { [key: string]: string }, pathIsFullyQualified?: boolean): Promise<Response<T>>
    put<T = any>(path: string, params?: any, headers?: { [key: string]: string }): Promise<Response<T>>
    putForm<T = any>(path: string, params?: any, headers?: { [key: string]: string }): Promise<Response<T>>
    patch<T = any>(path: string, params?: any, headers?: { [key: string]: string }): Promise<Response<T>>
    patchForm<T = any>(path: string, params?: any, headers?: { [key: string]: string }): Promise<Response<T>>
    post<T = any>(path: string, params?: any, headers?: { [key: string]: string }): Promise<Response<T>>
    postForm<T = any>(path: string, params?: any, headers?: { [key: string]: string }): Promise<Response<T>>
    del<T = any>(path: string, params?: any, headers?: { [key: string]: string }): Promise<Response<T>>
    cancel(): void
    socket(path: string, stream: string, params?: string): WebSocket
  }

  /**
   * Friendica API client.
   *
   * Using axios for request, you will handle promises.
   */
  export class Client implements Interface {
    static DEFAULT_SCOPE = DEFAULT_SCOPE
    static DEFAULT_URL = 'https://mastodon.social'
    static NO_REDIRECT = NO_REDIRECT

    private accessToken: string | null
    private baseUrl: string
    private userAgent: string
    private abortController: AbortController
    private proxyConfig: ProxyConfig | false = false

    /**
     * @param baseUrl hostname or base URL
     * @param accessToken access token from OAuth2 authorization
     * @param userAgent UserAgent is specified in header on request.
     * @param proxyConfig Proxy setting, or set false if don't use proxy.
     */
    constructor(
      baseUrl: string,
      accessToken: string | null = null,
      userAgent: string = DEFAULT_UA,
      proxyConfig: ProxyConfig | false = false
    ) {
      this.accessToken = accessToken
      this.baseUrl = baseUrl
      this.userAgent = userAgent
      this.proxyConfig = proxyConfig
      this.abortController = new AbortController()
      axios.defaults.signal = this.abortController.signal
    }

    /**
     * GET request to mastodon REST API.
     * @param path relative path from baseUrl
     * @param params Query parameters
     * @param headers Request header object
     */
    public async get<T>(
      path: string,
      params = {},
      headers: { [key: string]: string } = {},
      pathIsFullyQualified = false
    ): Promise<Response<T>> {
      let options: AxiosRequestConfig = {
        params: params,
        headers: headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
      if (this.accessToken) {
        options = objectAssignDeep({}, options, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        })
      }
      if (this.proxyConfig) {
        options = Object.assign(options, {
          httpAgent: proxyAgent(this.proxyConfig),
          httpsAgent: proxyAgent(this.proxyConfig)
        })
      }
      return axios
        .get<T>((pathIsFullyQualified ? '' : this.baseUrl) + path, options)
        .catch((err: Error) => {
          if (axios.isCancel(err)) {
            throw new RequestCanceledError(err.message)
          } else {
            throw err
          }
        })
        .then((resp: AxiosResponse<T>) => {
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
     * PUT request to mastodon REST API.
     * @param path relative path from baseUrl
     * @param params Form data. If you want to post file, please use FormData()
     * @param headers Request header object
     */
    public async put<T>(path: string, params = {}, headers: { [key: string]: string } = {}): Promise<Response<T>> {
      let options: AxiosRequestConfig = {
        headers: headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
      if (this.accessToken) {
        options = objectAssignDeep({}, options, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        })
      }
      if (this.proxyConfig) {
        options = Object.assign(options, {
          httpAgent: proxyAgent(this.proxyConfig),
          httpsAgent: proxyAgent(this.proxyConfig)
        })
      }
      return axios
        .put<T>(this.baseUrl + path, params, options)
        .catch((err: Error) => {
          if (axios.isCancel(err)) {
            throw new RequestCanceledError(err.message)
          } else {
            throw err
          }
        })
        .then((resp: AxiosResponse<T>) => {
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
     * PUT request to mastodon REST API for multipart.
     * @param path relative path from baseUrl
     * @param params Form data. If you want to post file, please use FormData()
     * @param headers Request header object
     */
    public async putForm<T>(path: string, params = {}, headers: { [key: string]: string } = {}): Promise<Response<T>> {
      let options: AxiosRequestConfig = {
        headers: headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
      if (this.accessToken) {
        options = objectAssignDeep({}, options, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        })
      }
      if (this.proxyConfig) {
        options = Object.assign(options, {
          httpAgent: proxyAgent(this.proxyConfig),
          httpsAgent: proxyAgent(this.proxyConfig)
        })
      }
      return axios
        .putForm<T>(this.baseUrl + path, params, options)
        .catch((err: Error) => {
          if (axios.isCancel(err)) {
            throw new RequestCanceledError(err.message)
          } else {
            throw err
          }
        })
        .then((resp: AxiosResponse<T>) => {
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
     * PATCH request to mastodon REST API.
     * @param path relative path from baseUrl
     * @param params Form data. If you want to post file, please use FormData()
     * @param headers Request header object
     */
    public async patch<T>(path: string, params = {}, headers: { [key: string]: string } = {}): Promise<Response<T>> {
      let options: AxiosRequestConfig = {
        headers: headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
      if (this.accessToken) {
        options = objectAssignDeep({}, options, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        })
      }
      if (this.proxyConfig) {
        options = Object.assign(options, {
          httpAgent: proxyAgent(this.proxyConfig),
          httpsAgent: proxyAgent(this.proxyConfig)
        })
      }
      return axios
        .patch<T>(this.baseUrl + path, params, options)
        .catch((err: Error) => {
          if (axios.isCancel(err)) {
            throw new RequestCanceledError(err.message)
          } else {
            throw err
          }
        })
        .then((resp: AxiosResponse<T>) => {
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
     * PATCH request to mastodon REST API for multipart.
     * @param path relative path from baseUrl
     * @param params Form data. If you want to post file, please use FormData()
     * @param headers Request header object
     */
    public async patchForm<T>(path: string, params = {}, headers: { [key: string]: string } = {}): Promise<Response<T>> {
      let options: AxiosRequestConfig = {
        headers: headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
      if (this.accessToken) {
        options = objectAssignDeep({}, options, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        })
      }
      if (this.proxyConfig) {
        options = Object.assign(options, {
          httpAgent: proxyAgent(this.proxyConfig),
          httpsAgent: proxyAgent(this.proxyConfig)
        })
      }
      return axios
        .patchForm<T>(this.baseUrl + path, params, options)
        .catch((err: Error) => {
          if (axios.isCancel(err)) {
            throw new RequestCanceledError(err.message)
          } else {
            throw err
          }
        })
        .then((resp: AxiosResponse<T>) => {
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
     * @param headers Request header object
     */
    public async post<T>(path: string, params = {}, headers: { [key: string]: string } = {}): Promise<Response<T>> {
      let options: AxiosRequestConfig = {
        headers: headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
      if (this.accessToken) {
        options = objectAssignDeep({}, options, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        })
      }
      if (this.proxyConfig) {
        options = Object.assign(options, {
          httpAgent: proxyAgent(this.proxyConfig),
          httpsAgent: proxyAgent(this.proxyConfig)
        })
      }
      return axios.post<T>(this.baseUrl + path, params, options).then((resp: AxiosResponse<T>) => {
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
     * POST request to mastodon REST API for multipart.
     * @param path relative path from baseUrl
     * @param params Form data
     * @param headers Request header object
     */
    public async postForm<T>(path: string, params = {}, headers: { [key: string]: string } = {}): Promise<Response<T>> {
      let options: AxiosRequestConfig = {
        headers: headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
      if (this.accessToken) {
        options = objectAssignDeep({}, options, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        })
      }
      if (this.proxyConfig) {
        options = Object.assign(options, {
          httpAgent: proxyAgent(this.proxyConfig),
          httpsAgent: proxyAgent(this.proxyConfig)
        })
      }
      return axios.postForm<T>(this.baseUrl + path, params, options).then((resp: AxiosResponse<T>) => {
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
     * DELETE request to mastodon REST API.
     * @param path relative path from baseUrl
     * @param params Form data
     * @param headers Request header object
     */
    public async del<T>(path: string, params = {}, headers: { [key: string]: string } = {}): Promise<Response<T>> {
      let options: AxiosRequestConfig = {
        data: params,
        headers: headers,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
      if (this.accessToken) {
        options = objectAssignDeep({}, options, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        })
      }
      if (this.proxyConfig) {
        options = Object.assign(options, {
          httpAgent: proxyAgent(this.proxyConfig),
          httpsAgent: proxyAgent(this.proxyConfig)
        })
      }
      return axios
        .delete(this.baseUrl + path, options)
        .catch((err: Error) => {
          if (axios.isCancel(err)) {
            throw new RequestCanceledError(err.message)
          } else {
            throw err
          }
        })
        .then((resp: AxiosResponse) => {
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
     * Get connection and receive websocket connection for Pleroma API.
     *
     * @param path relative path from baseUrl: normally it is `/streaming`.
     * @param stream Stream name, please refer: https://git.pleroma.social/pleroma/pleroma/blob/develop/lib/pleroma/web/mastodon_api/mastodon_socket.ex#L19-28
     * @returns WebSocket, which inherits from EventEmitter
     */
    public socket(path: string, stream: string, params?: string): WebSocket {
      if (!this.accessToken) {
        throw new Error('accessToken is required')
      }
      const url = this.baseUrl + path
      const streaming = new WebSocket(url, stream, params, this.accessToken, this.userAgent, this.proxyConfig)
      process.nextTick(() => {
        streaming.start()
      })
      return streaming
    }
  }

  export namespace Entity {
    export type Account = FriendicaEntity.Account
    export type Activity = FriendicaEntity.Activity
    export type Application = FriendicaEntity.Application
    export type AsyncAttachment = FriendicaEntity.AsyncAttachment
    export type Attachment = FriendicaEntity.Attachment
    export type Card = FriendicaEntity.Card
    export type Context = FriendicaEntity.Context
    export type Conversation = FriendicaEntity.Conversation
    export type Emoji = FriendicaEntity.Emoji
    export type FeaturedTag = FriendicaEntity.FeaturedTag
    export type Field = FriendicaEntity.Field
    export type Filter = FriendicaEntity.Filter
    export type FollowRequest = FriendicaEntity.FollowRequest
    export type History = FriendicaEntity.History
    export type IdentityProof = FriendicaEntity.IdentityProof
    export type Instance = FriendicaEntity.Instance
    export type List = FriendicaEntity.List
    export type Marker = FriendicaEntity.Marker
    export type Mention = FriendicaEntity.Mention
    export type Notification = FriendicaEntity.Notification
    export type Poll = FriendicaEntity.Poll
    export type PollOption = FriendicaEntity.PollOption
    export type Preferences = FriendicaEntity.Preferences
    export type PushSubscription = FriendicaEntity.PushSubscription
    export type Relationship = FriendicaEntity.Relationship
    export type Report = FriendicaEntity.Report
    export type Results = FriendicaEntity.Results
    export type ScheduledStatus = FriendicaEntity.ScheduledStatus
    export type Source = FriendicaEntity.Source
    export type Stats = FriendicaEntity.Stats
    export type Status = FriendicaEntity.Status
    export type StatusParams = FriendicaEntity.StatusParams
    export type StatusSource = FriendicaEntity.StatusSource
    export type Tag = FriendicaEntity.Tag
    export type Token = FriendicaEntity.Token
    export type URLs = FriendicaEntity.URLs
  }

  export namespace Converter {
    export const encodeNotificationType = (
      t: MegalodonEntity.NotificationType
    ): FriendicaEntity.NotificationType | UnknownNotificationTypeError => {
      switch (t) {
        case NotificationType.Follow:
          return FriendicaNotificationType.Follow
        case NotificationType.Favourite:
          return FriendicaNotificationType.Favourite
        case NotificationType.Reblog:
          return FriendicaNotificationType.Reblog
        case NotificationType.Mention:
          return FriendicaNotificationType.Mention
        case NotificationType.FollowRequest:
          return FriendicaNotificationType.FollowRequest
        case NotificationType.Status:
          return FriendicaNotificationType.Status
        case NotificationType.PollExpired:
          return FriendicaNotificationType.Poll
        case NotificationType.Update:
          return FriendicaNotificationType.Update
        default:
          return new UnknownNotificationTypeError()
      }
    }

    export const decodeNotificationType = (
      t: FriendicaEntity.NotificationType
    ): MegalodonEntity.NotificationType | UnknownNotificationTypeError => {
      switch (t) {
        case FriendicaNotificationType.Follow:
          return NotificationType.Follow
        case FriendicaNotificationType.Favourite:
          return NotificationType.Favourite
        case FriendicaNotificationType.Mention:
          return NotificationType.Mention
        case FriendicaNotificationType.Reblog:
          return NotificationType.Reblog
        case FriendicaNotificationType.FollowRequest:
          return NotificationType.FollowRequest
        case FriendicaNotificationType.Status:
          return NotificationType.Status
        case FriendicaNotificationType.Poll:
          return NotificationType.PollExpired
        case FriendicaNotificationType.Update:
          return NotificationType.Update
        default:
          return new UnknownNotificationTypeError()
      }
    }

    export const account = (a: Entity.Account): MegalodonEntity.Account => ({
      id: a.id,
      username: a.username,
      acct: a.acct,
      display_name: a.display_name,
      locked: a.locked,
      discoverable: a.discoverable,
      group: a.group,
      noindex: null,
      suspended: null,
      limited: null,
      created_at: a.created_at,
      followers_count: a.followers_count,
      following_count: a.following_count,
      statuses_count: a.statuses_count,
      note: a.note,
      url: a.url,
      avatar: a.avatar,
      avatar_static: a.avatar_static,
      header: a.header,
      header_static: a.header_static,
      emojis: a.emojis.map(e => emoji(e)),
      moved: a.moved ? account(a.moved) : null,
      fields: a.fields.map(f => field(f)),
      bot: a.bot,
      source: a.source ? source(a.source) : undefined
    })
    export const activity = (a: Entity.Activity): MegalodonEntity.Activity => a
    export const application = (a: Entity.Application): MegalodonEntity.Application => a
    export const attachment = (a: Entity.Attachment): MegalodonEntity.Attachment => a
    export const async_attachment = (a: Entity.AsyncAttachment) => {
      if (a.url) {
        return {
          id: a.id,
          type: a.type,
          url: a.url,
          remote_url: a.remote_url,
          preview_url: a.preview_url,
          text_url: a.text_url,
          meta: a.meta,
          description: a.description,
          blurhash: a.blurhash
        } as MegalodonEntity.Attachment
      } else {
        return a as MegalodonEntity.AsyncAttachment
      }
    }
    export const card = (c: Entity.Card): MegalodonEntity.Card => ({
      url: c.url,
      title: c.title,
      description: c.description,
      type: c.type,
      image: c.image,
      author_name: c.author_name,
      author_url: c.author_url,
      provider_name: c.provider_name,
      provider_url: c.provider_url,
      html: c.html,
      width: c.width,
      height: c.height,
      embed_url: null,
      blurhash: c.blurhash
    })
    export const context = (c: Entity.Context): MegalodonEntity.Context => ({
      ancestors: Array.isArray(c.ancestors) ? c.ancestors.map(a => status(a)) : [],
      descendants: Array.isArray(c.descendants) ? c.descendants.map(d => status(d)) : []
    })
    export const conversation = (c: Entity.Conversation): MegalodonEntity.Conversation => ({
      id: c.id,
      accounts: Array.isArray(c.accounts) ? c.accounts.map(a => account(a)) : [],
      last_status: c.last_status ? status(c.last_status) : null,
      unread: c.unread
    })
    export const emoji = (e: Entity.Emoji): MegalodonEntity.Emoji => ({
      shortcode: e.shortcode,
      static_url: e.static_url,
      url: e.url,
      visible_in_picker: e.visible_in_picker
    })
    export const featured_tag = (e: Entity.FeaturedTag): MegalodonEntity.FeaturedTag => e
    export const field = (f: Entity.Field): MegalodonEntity.Field => f
    export const filter = (f: Entity.Filter): MegalodonEntity.Filter => f
    export const follow_request = (f: Entity.FollowRequest): MegalodonEntity.FollowRequest => ({
      id: f.id,
      username: f.username,
      acct: f.acct,
      display_name: f.display_name,
      locked: f.locked,
      bot: f.bot,
      discoverable: f.discoverable,
      group: f.group,
      created_at: f.created_at,
      note: f.note,
      url: f.url,
      avatar: f.avatar,
      avatar_static: f.avatar_static,
      header: f.header,
      header_static: f.header_static,
      followers_count: f.followers_count,
      following_count: f.following_count,
      statuses_count: f.statuses_count,
      emojis: f.emojis.map(e => emoji(e)),
      fields: f.fields.map(f => field(f))
    })
    export const history = (h: Entity.History): MegalodonEntity.History => h
    export const identity_proof = (i: Entity.IdentityProof): MegalodonEntity.IdentityProof => i
    export const instance = (i: Entity.Instance): MegalodonEntity.Instance => {
      return {
        uri: i.uri,
        title: i.title,
        description: i.description,
        email: i.email,
        version: i.version,
        thumbnail: i.thumbnail,
        urls: i.urls ? urls(i.urls) : null,
        stats: stats(i.stats),
        languages: i.languages,
        registrations: i.registrations,
        approval_required: i.approval_required,
        invites_enabled: i.invites_enabled,
        configuration: {
          statuses: {
            max_characters: i.max_toot_chars
          }
        },
        contact_account: account(i.contact_account),
        rules: i.rules
      }
    }
    export const list = (l: Entity.List): MegalodonEntity.List => l
    export const marker = (m: Entity.Marker): MegalodonEntity.Marker => m
    export const mention = (m: Entity.Mention): MegalodonEntity.Mention => m
    export const notification = (n: Entity.Notification): MegalodonEntity.Notification | UnknownNotificationTypeError => {
      const notificationType = decodeNotificationType(n.type)
      if (notificationType instanceof UnknownNotificationTypeError) return notificationType
      if (n.status) {
        return {
          account: account(n.account),
          created_at: n.created_at,
          id: n.id,
          status: status(n.status),
          type: notificationType
        }
      } else {
        return {
          account: account(n.account),
          created_at: n.created_at,
          id: n.id,
          type: notificationType
        }
      }
    }
    export const poll = (p: Entity.Poll): MegalodonEntity.Poll => p
    export const poll_option = (p: Entity.PollOption): MegalodonEntity.PollOption => p
    export const preferences = (p: Entity.Preferences): MegalodonEntity.Preferences => p
    export const push_subscription = (p: Entity.PushSubscription): MegalodonEntity.PushSubscription => p
    export const relationship = (r: Entity.Relationship): MegalodonEntity.Relationship => r
    export const report = (r: Entity.Report): MegalodonEntity.Report => ({
      id: r.id,
      action_taken: r.action_taken,
      action_taken_at: null,
      category: r.category,
      comment: r.comment,
      forwarded: r.forwarded,
      status_ids: r.status_ids,
      rule_ids: r.rule_ids,
      target_account: account(r.target_account)
    })
    export const results = (r: Entity.Results): MegalodonEntity.Results => ({
      accounts: Array.isArray(r.accounts) ? r.accounts.map(a => account(a)) : [],
      statuses: Array.isArray(r.statuses) ? r.statuses.map(s => status(s)) : [],
      hashtags: Array.isArray(r.hashtags) ? r.hashtags.map(h => tag(h)) : []
    })
    export const scheduled_status = (s: Entity.ScheduledStatus): MegalodonEntity.ScheduledStatus => {
      return {
        id: s.id,
        scheduled_at: s.scheduled_at,
        params: status_params(s.params),
        media_attachments: s.media_attachments ? s.media_attachments.map(a => attachment(a)) : null
      }
    }
    export const source = (s: Entity.Source): MegalodonEntity.Source => s
    export const stats = (s: Entity.Stats): MegalodonEntity.Stats => s
    export const status = (s: Entity.Status): MegalodonEntity.Status => ({
      id: s.id,
      uri: s.uri,
      url: s.url,
      account: account(s.account),
      in_reply_to_id: s.in_reply_to_id,
      in_reply_to_account_id: s.in_reply_to_account_id,
      reblog: s.reblog ? status(s.reblog) : s.quote ? status(s.quote) : null,
      content: s.content,
      plain_content: null,
      created_at: s.created_at,
      emojis: Array.isArray(s.emojis) ? s.emojis.map(e => emoji(e)) : [],
      replies_count: s.replies_count,
      reblogs_count: s.reblogs_count,
      favourites_count: s.favourites_count,
      reblogged: s.reblogged,
      favourited: s.favourited,
      muted: s.muted,
      sensitive: s.sensitive,
      spoiler_text: s.spoiler_text,
      visibility: s.visibility,
      media_attachments: Array.isArray(s.media_attachments) ? s.media_attachments.map(m => attachment(m)) : [],
      mentions: Array.isArray(s.mentions) ? s.mentions.map(m => mention(m)) : [],
      tags: s.tags,
      card: s.card ? card(s.card) : null,
      poll: s.poll ? poll(s.poll) : null,
      application: s.application ? application(s.application) : null,
      language: s.language,
      pinned: s.pinned,
      emoji_reactions: [],
      bookmarked: s.bookmarked ? s.bookmarked : false,
      quote: false
    })
    export const status_params = (s: Entity.StatusParams): MegalodonEntity.StatusParams => {
      return {
        text: s.text,
        in_reply_to_id: s.in_reply_to_id,
        media_ids: s.media_ids,
        sensitive: s.sensitive,
        spoiler_text: s.spoiler_text,
        visibility: s.visibility,
        scheduled_at: s.scheduled_at,
        application_id: parseInt(s.application_id)
      }
    }
    export const status_source = (s: Entity.StatusSource): MegalodonEntity.StatusSource => s
    export const tag = (t: Entity.Tag): MegalodonEntity.Tag => t
    export const token = (t: Entity.Token): MegalodonEntity.Token => t
    export const urls = (u: Entity.URLs): MegalodonEntity.URLs => u
  }
}
export default FriendicaAPI
