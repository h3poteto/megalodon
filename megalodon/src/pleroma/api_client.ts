import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import objectAssignDeep from 'object-assign-deep'

import MegalodonEntity from '../entity'
import PleromaEntity from './entity'
import Response from '../response'
import { RequestCanceledError } from '../cancel'
import proxyAgent, { ProxyConfig } from '../proxy_config'
import { NO_REDIRECT, DEFAULT_SCOPE, DEFAULT_UA } from '../default'
import WebSocket from './web_socket'
import NotificationType, { UnknownNotificationTypeError } from '../notification'
import PleromaNotificationType from './notification'

namespace PleromaAPI {
  export namespace Entity {
    export type Account = PleromaEntity.Account
    export type Activity = PleromaEntity.Activity
    export type Announcement = PleromaEntity.Announcement
    export type Application = PleromaEntity.Application
    export type AsyncAttachment = PleromaEntity.AsyncAttachment
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
    export type StatusSource = PleromaEntity.StatusSource
    export type Tag = PleromaEntity.Tag
    export type Token = PleromaEntity.Token
    export type URLs = PleromaEntity.URLs
  }

  export namespace Converter {
    export const decodeNotificationType = (
      t: PleromaEntity.NotificationType
    ): MegalodonEntity.NotificationType | UnknownNotificationTypeError => {
      switch (t) {
        case PleromaNotificationType.Mention:
          return NotificationType.Mention
        case PleromaNotificationType.Reblog:
          return NotificationType.Reblog
        case PleromaNotificationType.Favourite:
          return NotificationType.Favourite
        case PleromaNotificationType.Follow:
          return NotificationType.Follow
        case PleromaNotificationType.Poll:
          return NotificationType.PollExpired
        case PleromaNotificationType.PleromaEmojiReaction:
          return NotificationType.EmojiReaction
        case PleromaNotificationType.FollowRequest:
          return NotificationType.FollowRequest
        case PleromaNotificationType.Update:
          return NotificationType.Update
        case PleromaNotificationType.Move:
          return NotificationType.Move
        default:
          return new UnknownNotificationTypeError()
      }
    }
    export const encodeNotificationType = (
      t: MegalodonEntity.NotificationType
    ): PleromaEntity.NotificationType | UnknownNotificationTypeError => {
      switch (t) {
        case NotificationType.Follow:
          return PleromaNotificationType.Follow
        case NotificationType.Favourite:
          return PleromaNotificationType.Favourite
        case NotificationType.Reblog:
          return PleromaNotificationType.Reblog
        case NotificationType.Mention:
          return PleromaNotificationType.Mention
        case NotificationType.PollExpired:
          return PleromaNotificationType.Poll
        case NotificationType.EmojiReaction:
          return PleromaNotificationType.PleromaEmojiReaction
        case NotificationType.FollowRequest:
          return PleromaNotificationType.FollowRequest
        case NotificationType.Update:
          return PleromaNotificationType.Update
        case NotificationType.Move:
          return PleromaNotificationType.Move
        default:
          return new UnknownNotificationTypeError()
      }
    }

    export const account = (a: Entity.Account): MegalodonEntity.Account => {
      return {
        id: a.id,
        username: a.username,
        acct: a.acct,
        display_name: a.display_name,
        locked: a.locked,
        discoverable: a.discoverable,
        group: null,
        noindex: a.noindex,
        suspended: a.suspended,
        limited: a.limited,
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
        fields: a.fields,
        bot: a.bot,
        source: a.source
      }
    }
    export const activity = (a: Entity.Activity): MegalodonEntity.Activity => a
    export const announcement = (a: Entity.Announcement): MegalodonEntity.Announcement => ({
      id: a.id,
      content: a.content,
      starts_at: a.starts_at,
      ends_at: a.ends_at,
      published: a.published,
      all_day: a.all_day,
      published_at: a.published_at,
      updated_at: a.updated_at,
      read: null,
      mentions: a.mentions,
      statuses: a.statuses,
      tags: a.tags,
      emojis: a.emojis,
      reactions: a.reactions
    })
    export const application = (a: Entity.Application): MegalodonEntity.Application => a
    export const attachment = (a: Entity.Attachment): MegalodonEntity.Attachment => a
    export const async_attachment = (a: Entity.AsyncAttachment) => {
      if (a.url) {
        return {
          id: a.id,
          type: a.type,
          url: a.url!,
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
      author_name: null,
      author_url: null,
      provider_name: c.provider_name,
      provider_url: c.provider_url,
      html: null,
      width: null,
      height: null,
      embed_url: null,
      blurhash: null
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
    export const featured_tag = (f: Entity.FeaturedTag): MegalodonEntity.FeaturedTag => f
    export const field = (f: Entity.Field): MegalodonEntity.Field => f
    export const filter = (f: Entity.Filter): MegalodonEntity.Filter => f
    export const history = (h: Entity.History): MegalodonEntity.History => h
    export const identity_proof = (i: Entity.IdentityProof): MegalodonEntity.IdentityProof => i
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
      configuration: {
        statuses: {
          max_characters: i.max_toot_chars,
          max_media_attachments: i.max_media_attachments
        },
        polls: {
          max_options: i.poll_limits.max_options,
          max_characters_per_option: i.poll_limits.max_option_chars,
          min_expiration: i.poll_limits.min_expiration,
          max_expiration: i.poll_limits.max_expiration
        }
      }
    })
    export const list = (l: Entity.List): MegalodonEntity.List => ({
      id: l.id,
      title: l.title,
      replies_policy: null
    })
    export const marker = (m: Entity.Marker | Record<never, never>): MegalodonEntity.Marker | Record<never, never> => {
      if ((m as any).notifications) {
        const mm = m as Entity.Marker
        return {
          notifications: {
            last_read_id: mm.notifications.last_read_id,
            version: mm.notifications.version,
            updated_at: mm.notifications.updated_at,
            unread_count: mm.notifications.pleroma.unread_count
          }
        }
      } else {
        return {}
      }
    }
    export const mention = (m: Entity.Mention): MegalodonEntity.Mention => m
    export const notification = (n: Entity.Notification): MegalodonEntity.Notification | UnknownNotificationTypeError => {
      const notificationType = decodeNotificationType(n.type)
      if (notificationType instanceof UnknownNotificationTypeError) return notificationType
      if (n.status && n.emoji) {
        return {
          id: n.id,
          account: account(n.account),
          created_at: n.created_at,
          status: status(n.status),
          emoji: n.emoji,
          type: notificationType
        }
      } else if (n.status) {
        return {
          id: n.id,
          account: account(n.account),
          created_at: n.created_at,
          status: status(n.status),
          type: notificationType
        }
      } else if (n.target) {
        return {
          id: n.id,
          account: account(n.account),
          created_at: n.created_at,
          target: account(n.target),
          type: notificationType
        }
      } else {
        return {
          id: n.id,
          account: account(n.account),
          created_at: n.created_at,
          type: notificationType
        }
      }
    }
    export const poll = (p: Entity.Poll): MegalodonEntity.Poll => p
    export const pollOption = (p: Entity.PollOption): MegalodonEntity.PollOption => p
    export const preferences = (p: Entity.Preferences): MegalodonEntity.Preferences => p
    export const push_subscription = (p: Entity.PushSubscription): MegalodonEntity.PushSubscription => p
    export const reaction = (r: Entity.Reaction): MegalodonEntity.Reaction => {
      const p = {
        count: r.count,
        me: r.me,
        name: r.name
      }
      if (r.accounts) {
        return Object.assign({}, p, {
          accounts: r.accounts.map(a => account(a))
        })
      }
      return p
    }
    export const relationship = (r: Entity.Relationship): MegalodonEntity.Relationship => ({
      id: r.id,
      following: r.following,
      followed_by: r.followed_by,
      blocking: r.blocking,
      blocked_by: r.blocked_by,
      muting: r.muting,
      muting_notifications: r.muting_notifications,
      requested: r.requested,
      domain_blocking: r.domain_blocking,
      showing_reblogs: r.showing_reblogs,
      endorsed: r.endorsed,
      notifying: r.notifying,
      note: r.note
    })
    export const report = (r: Entity.Report): MegalodonEntity.Report => ({
      id: r.id,
      action_taken: r.action_taken,
      action_taken_at: null,
      category: null,
      comment: null,
      forwarded: null,
      status_ids: null,
      rule_ids: null
    })
    export const results = (r: Entity.Results): MegalodonEntity.Results => ({
      accounts: Array.isArray(r.accounts) ? r.accounts.map(a => account(a)) : [],
      statuses: Array.isArray(r.statuses) ? r.statuses.map(s => status(s)) : [],
      hashtags: Array.isArray(r.hashtags) ? r.hashtags.map(h => tag(h)) : []
    })
    export const scheduled_status = (s: Entity.ScheduledStatus): MegalodonEntity.ScheduledStatus => ({
      id: s.id,
      scheduled_at: s.scheduled_at,
      params: status_params(s.params),
      media_attachments: Array.isArray(s.media_attachments) ? s.media_attachments.map(m => attachment(m)) : null
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
      plain_content: s.pleroma.content?.['text/plain'] ? s.pleroma.content['text/plain'] : null,
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
      emoji_reactions: Array.isArray(s.pleroma.emoji_reactions) ? s.pleroma.emoji_reactions.map(r => reaction(r)) : [],
      bookmarked: s.bookmarked ? s.bookmarked : false,
      quote: s.reblog !== null && s.reblog.content !== s.content
    })
    export const status_params = (s: Entity.StatusParams): MegalodonEntity.StatusParams => {
      return {
        text: s.text,
        in_reply_to_id: s.in_reply_to_id,
        media_ids: Array.isArray(s.media_ids) ? s.media_ids : null,
        sensitive: s.sensitive,
        spoiler_text: s.spoiler_text,
        visibility: s.visibility,
        scheduled_at: s.scheduled_at,
        application_id: null
      }
    }
    export const status_source = (s: Entity.StatusSource): MegalodonEntity.StatusSource => s
    export const tag = (t: Entity.Tag): MegalodonEntity.Tag => t
    export const token = (t: Entity.Token): MegalodonEntity.Token => t
    export const urls = (u: Entity.URLs): MegalodonEntity.URLs => u
  }

  /**
   * Interface
   */
  export interface Interface {
    get<T = any>(path: string, params?: any, headers?: { [key: string]: string }): Promise<Response<T>>
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
   * Mastodon API client.
   *
   * Using axios for request, you will handle promises.
   */
  export class Client implements Interface {
    static DEFAULT_SCOPE = DEFAULT_SCOPE
    static DEFAULT_URL = 'https://pleroma.io'
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
    public async get<T>(path: string, params = {}, headers: { [key: string]: string } = {}): Promise<Response<T>> {
      let options: AxiosRequestConfig = {
        params: params,
        headers: headers
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
        .get<T>(this.baseUrl + path, options)
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
}

export default PleromaAPI
