import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import objectAssignDeep from 'object-assign-deep'

import Streaming from './web_socket'
import Response from '../response'
import { RequestCanceledError } from '../cancel'
import { NO_REDIRECT, DEFAULT_SCOPE, DEFAULT_UA } from '../default'
import GotosocialEntity from './entity'
import MegalodonEntity from '../entity'
import NotificationType, { UnknownNotificationTypeError } from '../notification'
import GotosocialNotificationType from './notification'

namespace GotosocialAPI {
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
    socket(url: string, stream: string, params?: string): Streaming
  }

  /**
   * Gotosocial API client.
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

    /**
     * @param baseUrl hostname or base URL
     * @param accessToken access token from OAuth2 authorization
     * @param userAgent UserAgent is specified in header on request.
     */
    constructor(baseUrl: string, accessToken: string | null = null, userAgent: string = DEFAULT_UA) {
      this.accessToken = accessToken
      this.baseUrl = baseUrl
      this.userAgent = userAgent
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
     * @param url Streaming url.
     * @param stream Stream name, please refer: https://git.pleroma.social/pleroma/pleroma/blob/develop/lib/pleroma/web/mastodon_api/mastodon_socket.ex#L19-28
     * @returns WebSocket, which inherits from EventEmitter
     */
    public socket(url: string, stream: string, params?: string): Streaming {
      if (!this.accessToken) {
        throw new Error('accessToken is required')
      }
      const streaming = new Streaming(url, stream, params, this.accessToken, this.userAgent)

      streaming.start()
      return streaming
    }
  }

  export namespace Entity {
    export type Account = GotosocialEntity.Account
    export type Application = GotosocialEntity.Application
    export type AsyncAttachment = MegalodonEntity.AsyncAttachment
    export type Attachment = GotosocialEntity.Attachment
    export type Card = GotosocialEntity.Card
    export type Context = GotosocialEntity.Context
    export type Emoji = GotosocialEntity.Emoji
    export type Field = GotosocialEntity.Field
    export type Filter = GotosocialEntity.Filter
    export type Instance = GotosocialEntity.Instance
    export type List = GotosocialEntity.List
    export type Marker = GotosocialEntity.Marker
    export type Mention = GotosocialEntity.Mention
    export type Notification = GotosocialEntity.Notification
    export type Poll = GotosocialEntity.Poll
    export type PollOption = GotosocialEntity.PollOption
    export type Preferences = GotosocialEntity.Preferences
    export type Relationship = GotosocialEntity.Relationship
    export type Report = GotosocialEntity.Report
    export type Results = GotosocialEntity.Results
    export type Role = GotosocialEntity.Role
    export type ScheduledStatus = GotosocialEntity.ScheduledStatus
    export type Source = GotosocialEntity.Source
    export type Stats = GotosocialEntity.Stats
    export type Status = GotosocialEntity.Status
    export type StatusParams = GotosocialEntity.StatusParams
    export type StatusSource = GotosocialEntity.StatusSource
    export type Tag = GotosocialEntity.Tag
    export type Token = GotosocialEntity.Token
    export type URLs = GotosocialEntity.URLs
  }

  export namespace Converter {
    export const encodeNotificationType = (
      t: MegalodonEntity.NotificationType
    ): GotosocialEntity.NotificationType | UnknownNotificationTypeError => {
      switch (t) {
        case NotificationType.Follow:
          return GotosocialNotificationType.Follow
        case NotificationType.Favourite:
          return GotosocialNotificationType.Favourite
        case NotificationType.Reblog:
          return GotosocialNotificationType.Reblog
        case NotificationType.Mention:
          return GotosocialNotificationType.Mention
        case NotificationType.FollowRequest:
          return GotosocialNotificationType.FollowRequest
        case NotificationType.Status:
          return GotosocialNotificationType.Status
        case NotificationType.PollExpired:
          return GotosocialNotificationType.Poll
        default:
          return new UnknownNotificationTypeError()
      }
    }

    export const decodeNotificationType = (
      t: GotosocialEntity.NotificationType
    ): MegalodonEntity.NotificationType | UnknownNotificationTypeError => {
      switch (t) {
        case GotosocialNotificationType.Follow:
          return NotificationType.Follow
        case GotosocialNotificationType.Favourite:
          return NotificationType.Favourite
        case GotosocialNotificationType.Mention:
          return NotificationType.Mention
        case GotosocialNotificationType.Reblog:
          return NotificationType.Reblog
        case GotosocialNotificationType.FollowRequest:
          return NotificationType.FollowRequest
        case GotosocialNotificationType.Status:
          return NotificationType.Status
        case GotosocialNotificationType.Poll:
          return NotificationType.PollExpired
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
      group: null,
      noindex: null,
      suspended: a.suspended,
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
      emojis: Array.isArray(a.emojis) ? a.emojis.map(e => emoji(e)) : [],
      moved: null,
      fields: Array.isArray(a.fields) ? a.fields.map(f => field(f)) : [],
      bot: a.bot,
      source: a.source ? source(a.source) : undefined,
      mute_expires_at: a.mute_expires_at,
      role: a.role ? a.role : undefined
    })
    export const application = (a: Entity.Application): MegalodonEntity.Application => a
    export const attachment = (a: Entity.Attachment): MegalodonEntity.Attachment => ({
      id: a.id,
      type: a.type,
      url: a.url ? a.url : '',
      remote_url: a.remote_url,
      preview_url: a.preview_url,
      text_url: a.text_url,
      meta: a.meta,
      description: a.description,
      blurhash: a.blurhash
    })
    export const async_attachment = (a: Entity.AsyncAttachment) => {
      if (a.url) {
        return {
          id: a.id,
          type: a.type,
          url: a.url ? a.url : '',
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
      image: c.image,
      type: c.type,
      author_name: c.author_name,
      author_url: c.author_url,
      provider_name: c.provider_name,
      provider_url: c.provider_url,
      html: c.html,
      width: c.width,
      height: c.height,
      embed_url: null,
      blurhash: null
    })
    export const context = (c: Entity.Context): MegalodonEntity.Context => ({
      ancestors: Array.isArray(c.ancestors) ? c.ancestors.map(a => status(a)) : [],
      descendants: Array.isArray(c.descendants) ? c.descendants.map(d => status(d)) : []
    })
    export const emoji = (e: Entity.Emoji): MegalodonEntity.Emoji => e
    export const field = (f: Entity.Field): MegalodonEntity.Field => f
    export const instance = (i: Entity.Instance): MegalodonEntity.Instance => ({
      uri: i.uri,
      title: i.title,
      description: i.description,
      email: i.email,
      version: i.version,
      thumbnail: i.thumbnail,
      urls: urls(i.urls),
      stats: stats(i.stats),
      languages: i.languages,
      registrations: i.registrations,
      approval_required: i.approval_required,
      invites_enabled: i.invites_enabled,
      contact_account: i.contact_account ? account(i.contact_account) : undefined,
      configuration: i.configuration,
      rules: []
    })
    export const list = (l: Entity.List): MegalodonEntity.List => ({
      id: l.id,
      title: l.title,
      replies_policy: l.replies_policy ? l.replies_policy : null
    })
    export const marker = (m: Entity.Marker | Record<never, never>): MegalodonEntity.Marker | Record<never, never> => m
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
    export const relationship = (r: Entity.Relationship): MegalodonEntity.Relationship => r
    export const report = (r: Entity.Report): MegalodonEntity.Report => ({
      id: r.id,
      action_taken: r.action_taken,
      action_taken_at: r.action_taken_at,
      status_ids: r.status_ids,
      category: r.category,
      comment: r.comment,
      forwarded: r.forwarded,
      rule_ids: r.rule_ids,
      target_account: account(r.target_account)
    })
    export const results = (r: Entity.Results): MegalodonEntity.Results => ({
      accounts: Array.isArray(r.accounts) ? r.accounts.map(a => account(a)) : [],
      statuses: Array.isArray(r.statuses) ? r.statuses.map(s => status(s)) : [],
      hashtags: Array.isArray(r.hashtags) ? r.hashtags.map(h => tag(h)) : []
    })
    export const scheduled_status = (s: Entity.ScheduledStatus): MegalodonEntity.ScheduledStatus => ({
      id: s.id,
      media_attachments: Array.isArray(s.media_attachments) ? s.media_attachments.map(m => attachment(m)) : [],
      params: status_params(s.params),
      scheduled_at: s.scheduled_at
    })
    export const source = (s: Entity.Source): MegalodonEntity.Source => ({
      privacy: s.privacy,
      sensitive: s.sensitive,
      language: s.language,
      note: s.note,
      fields: Array.isArray(s.fields) ? s.fields.map(f => field(f)) : []
    })
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
      plain_content: null,
      created_at: s.created_at,
      edited_at: null,
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
    export const status_params = (s: Entity.StatusParams): MegalodonEntity.StatusParams => s
    export const tag = (t: Entity.Tag): MegalodonEntity.Tag => ({
      name: t.name,
      url: t.url,
      history: []
    })
    export const token = (t: Entity.Token): MegalodonEntity.Token => t
    export const urls = (u: Entity.URLs): MegalodonEntity.URLs => u
    export const filter = (f: Entity.Filter): MegalodonEntity.Filter => f
    export const status_source = (s: Entity.StatusSource): MegalodonEntity.StatusSource => s
  }
}
export default GotosocialAPI
