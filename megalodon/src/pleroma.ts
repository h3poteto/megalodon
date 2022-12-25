import { OAuth2 } from 'oauth'
import FormData from 'form-data'

import PleromaAPI from './pleroma/api_client'
import WebSocket from './pleroma/web_socket'
import { MegalodonInterface, ArgumentError } from './megalodon'
import Response from './response'
import Entity from './entity'
import { NO_REDIRECT, DEFAULT_SCOPE, DEFAULT_UA } from './default'
import { ProxyConfig } from './proxy_config'
import OAuth from './oauth'

export default class Pleroma implements MegalodonInterface {
  public client: PleromaAPI.Interface
  public baseUrl: string

  /**
   * @param baseUrl hostname or base URL
   * @param accessToken access token from OAuth2 authorization
   * @param userAgent UserAgent is specified in header on request.
   * @param proxyConfig Proxy setting, or set false if don't use proxy.
   */
  constructor(
    baseUrl: string,
    accessToken: string | null = null,
    userAgent: string | null = DEFAULT_UA,
    proxyConfig: ProxyConfig | false = false
  ) {
    let token: string = ''
    if (accessToken) {
      token = accessToken
    }
    let agent: string = DEFAULT_UA
    if (userAgent) {
      agent = userAgent
    }
    this.client = new PleromaAPI.Client(baseUrl, token, agent, proxyConfig)
    this.baseUrl = baseUrl
  }

  public cancel(): void {
    return this.client.cancel()
  }

  public async registerApp(
    client_name: string,
    options: Partial<{ scopes: Array<string>; redirect_uris: string; website: string }>
  ): Promise<OAuth.AppData> {
    const scopes = options.scopes || DEFAULT_SCOPE
    return this.createApp(client_name, options).then(async appData => {
      return this.generateAuthUrl(appData.client_id, appData.client_secret, {
        scope: scopes,
        redirect_uri: appData.redirect_uri
      }).then(url => {
        appData.url = url
        return appData
      })
    })
  }

  /**
   * Call /api/v1/apps
   *
   * Create an application.
   * @param client_name your application's name
   * @param options Form Data
   */
  public async createApp(
    client_name: string,
    options: Partial<{ scopes: Array<string>; redirect_uris: string; website: string }>
  ): Promise<OAuth.AppData> {
    const scopes = options.scopes || DEFAULT_SCOPE
    const redirect_uris = options.redirect_uris || NO_REDIRECT

    const params: {
      client_name: string
      redirect_uris: string
      scopes: string
      website?: string
    } = {
      client_name: client_name,
      redirect_uris: redirect_uris,
      scopes: scopes.join(' ')
    }
    if (options.website) params.website = options.website

    return this.client
      .post<OAuth.AppDataFromServer>('/api/v1/apps', params)
      .then((res: Response<OAuth.AppDataFromServer>) => OAuth.AppData.from(res.data))
  }

  /**
   * Generate authorization url using OAuth2.
   *
   * @param clientId your OAuth app's client ID
   * @param clientSecret your OAuth app's client Secret
   * @param options as property, redirect_uri and scope are available, and must be the same as when you register your app
   */
  public generateAuthUrl(
    clientId: string,
    clientSecret: string,
    options: Partial<{ scope: Array<string>; redirect_uri: string }>
  ): Promise<string> {
    const scope = options.scope || DEFAULT_SCOPE
    const redirect_uri = options.redirect_uri || NO_REDIRECT
    return new Promise(resolve => {
      const oauth = new OAuth2(clientId, clientSecret, this.baseUrl, undefined, '/oauth/token')
      const url = oauth.getAuthorizeUrl({
        redirect_uri: redirect_uri,
        response_type: 'code',
        client_id: clientId,
        scope: scope.join(' ')
      })
      resolve(url)
    })
  }

  // ======================================
  // apps
  // ======================================
  public verifyAppCredentials(): Promise<Response<Entity.Application>> {
    return this.client.get<Entity.Application>('/api/v1/apps/verify_credentials')
  }

  // ======================================
  // apps/oauth
  // ======================================
  public async fetchAccessToken(
    client_id: string | null,
    client_secret: string,
    code: string,
    redirect_uri: string = NO_REDIRECT
  ): Promise<OAuth.TokenData> {
    if (!client_id) {
      throw new Error('client_id is required')
    }
    return this.client
      .post<OAuth.TokenDataFromServer>('/oauth/token', {
        client_id,
        client_secret,
        code,
        redirect_uri,
        grant_type: 'authorization_code'
      })
      .then((res: Response<OAuth.TokenDataFromServer>) => OAuth.TokenData.from(res.data))
  }

  public async refreshToken(client_id: string, client_secret: string, refresh_token: string): Promise<OAuth.TokenData> {
    return this.client
      .post<OAuth.TokenDataFromServer>('/oauth/token', {
        client_id,
        client_secret,
        refresh_token,
        grant_type: 'refresh_token'
      })
      .then((res: Response<OAuth.TokenDataFromServer>) => OAuth.TokenData.from(res.data))
  }

  public async revokeToken(client_id: string, client_secret: string, token: string): Promise<Response<{}>> {
    return this.client.post<{}>('/oauth/revoke', {
      client_id,
      client_secret,
      token
    })
  }

  // ======================================
  // accounts
  // ======================================
  public async registerAccount(
    username: string,
    email: string,
    password: string,
    agreement: boolean,
    locale: string,
    reason?: string | null
  ): Promise<Response<Entity.Token>> {
    let params = {
      username: username,
      email: email,
      password: password,
      agreement: agreement,
      locale: locale
    }
    if (reason) {
      params = Object.assign(params, {
        reason: reason
      })
    }
    return this.client.post<PleromaAPI.Entity.Token>('/api/v1/accounts', params).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.token(res.data)
      })
    })
  }

  public async verifyAccountCredentials(): Promise<Response<Entity.Account>> {
    return this.client.get<PleromaAPI.Entity.Account>('/api/v1/accounts/verify_credentials').then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.account(res.data)
      })
    })
  }

  public async updateCredentials(options?: {
    discoverable?: boolean
    bot?: boolean
    display_name?: string
    note?: string
    avatar?: string
    header?: string
    locked?: boolean
    source?: {
      privacy?: string
      sensitive?: boolean
      language?: string
    }
    fields_attributes?: Array<{ name: string; value: string }>
  }): Promise<Response<Entity.Account>> {
    let params = {}
    if (options) {
      if (options.discoverable !== undefined) {
        params = Object.assign(params, {
          discoverable: options.discoverable
        })
      }
      if (options.bot !== undefined) {
        params = Object.assign(params, {
          bot: options.bot
        })
      }
      if (options.display_name) {
        params = Object.assign(params, {
          display_name: options.display_name
        })
      }
      if (options.note) {
        params = Object.assign(params, {
          note: options.note
        })
      }
      if (options.avatar) {
        params = Object.assign(params, {
          avatar: options.avatar
        })
      }
      if (options.header) {
        params = Object.assign(params, {
          header: options.header
        })
      }
      if (options.locked !== undefined) {
        params = Object.assign(params, {
          locked: options.locked
        })
      }
      if (options.source) {
        params = Object.assign(params, {
          source: options.source
        })
      }
      if (options.fields_attributes) {
        params = Object.assign(params, {
          fields_attributes: options.fields_attributes
        })
      }
    }
    return this.client.patch<PleromaAPI.Entity.Account>('/api/v1/accounts/update_credentials', params).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.account(res.data)
      })
    })
  }

  public async getAccount(id: string): Promise<Response<Entity.Account>> {
    return this.client.get<PleromaAPI.Entity.Account>(`/api/v1/accounts/${id}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.account(res.data)
      })
    })
  }

  public async getAccountStatuses(
    id: string,
    options?: {
      limit?: number
      max_id?: string
      since_id?: string
      pinned?: boolean
      exclude_replies?: boolean
      exclude_reblogs?: boolean
      only_media?: boolean
    }
  ): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
      if (options.pinned) {
        params = Object.assign(params, {
          pinned: options.pinned
        })
      }
      if (options.exclude_replies) {
        params = Object.assign(params, {
          exclude_replies: options.exclude_replies
        })
      }
      if (options.exclude_reblogs) {
        params = Object.assign(params, {
          exclude_reblogs: options.exclude_reblogs
        })
      }
      if (options.only_media) {
        params = Object.assign(params, {
          only_media: options.only_media
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Status>>(`/api/v1/accounts/${id}/statuses`, params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => PleromaAPI.Converter.status(s))
      })
    })
  }

  public async subscribeAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<PleromaAPI.Entity.Relationship>(`/api/v1/pleroma/accounts/${id}/subscribe`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.relationship(res.data)
      })
    })
  }

  public async unsubscribeAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<PleromaAPI.Entity.Relationship>(`/api/v1/pleroma/accounts/${id}/unsubscribe`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.relationship(res.data)
      })
    })
  }

  public async getAccountFavourites(
    id: string,
    options?: {
      limit?: number
      max_id?: string
      since_id?: string
    }
  ): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Status>>(`/api/v1/pleroma/accounts/${id}/favourites`, params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => PleromaAPI.Converter.status(s))
      })
    })
  }

  public async getAccountFollowers(
    id: string,
    options?: {
      limit?: number
      max_id?: string
      since_id?: string
    }
  ): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (options) {
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Account>>(`/api/v1/accounts/${id}/followers`, params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => PleromaAPI.Converter.account(a))
      })
    })
  }

  public async getAccountFollowing(
    id: string,
    options?: {
      limit?: number
      max_id?: string
      since_id?: string
    }
  ): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (options) {
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.get<Array<MastodonEntity.Account>>(`/api/v1/accounts/${id}/following`, params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => PleromaAPI.Converter.account(a))
      })
    })
  }

  public async getAccountLists(id: string): Promise<Response<Array<Entity.List>>> {
    return this.client.get<Array<PleromaAPI.Entity.List>>(`/api/v1/accounts/${id}/lists`).then(res => {
      return Object.assign(res, {
        data: res.data.map(l => PleromaAPI.Converter.list(l))
      })
    })
  }

  public async getIdentityProof(id: string): Promise<Response<Array<Entity.IdentityProof>>> {
    return this.client.get<Array<PleromaAPI.Entity.IdentityProof>>(`/api/v1/accounts/${id}/identity_proofs`).then(res => {
      return Object.assign(res, {
        data: res.data.map(i => PleromaAPI.Converter.identity_proof(i))
      })
    })
  }

  public async followAccount(id: string, options?: { reblog?: boolean }): Promise<Response<Entity.Relationship>> {
    let params = {}
    if (options) {
      if (options.reblog !== undefined) {
        params = Object.assign(params, {
          reblog: options.reblog
        })
      }
    }
    return this.client.post<PleromaAPI.Entity.Relationship>(`/api/v1/accounts/${id}/follow`, params).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.relationship(res.data)
      })
    })
  }

  public async unfollowAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<PleromaAPI.Entity.Relationship>(`/api/v1/accounts/${id}/unfollow`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.relationship(res.data)
      })
    })
  }

  public async blockAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<PleromaAPI.Entity.Relationship>(`/api/v1/accounts/${id}/block`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.relationship(res.data)
      })
    })
  }

  public async unblockAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<PleromaAPI.Entity.Relationship>(`/api/v1/accounts/${id}/unblock`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.relationship(res.data)
      })
    })
  }

  public async muteAccount(id: string, notifications: boolean = true): Promise<Response<Entity.Relationship>> {
    return this.client
      .post<PleromaAPI.Entity.Relationship>(`/api/v1/accounts/${id}/mute`, {
        notifications: notifications
      })
      .then(res => {
        return Object.assign(res, {
          data: PleromaAPI.Converter.relationship(res.data)
        })
      })
  }

  public async unmuteAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<PleromaAPI.Entity.Relationship>(`/api/v1/accounts/${id}/unmute`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.relationship(res.data)
      })
    })
  }

  public async pinAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<PleromaAPI.Entity.Relationship>(`/api/v1/accounts/${id}/pin`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.relationship(res.data)
      })
    })
  }

  public async unpinAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<PleromaAPI.Entity.Relationship>(`/api/v1/accounts/${id}/unpin`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.relationship(res.data)
      })
    })
  }

  public async getRelationship(id: string): Promise<Response<Entity.Relationship>> {
    return this.client
      .get<Array<PleromaAPI.Entity.Relationship>>('/api/v1/accounts/relationships', {
        id: [id]
      })
      .then(res => {
        return Object.assign(res, {
          data: PleromaAPI.Converter.relationship(res.data[0])
        })
      })
  }

  public async getRelationships(ids: Array<string>): Promise<Response<Array<Entity.Relationship>>> {
    return this.client
      .get<Array<PleromaAPI.Entity.Relationship>>('/api/v1/accounts/relationships', {
        id: ids
      })
      .then(res => {
        return Object.assign(res, {
          data: res.data.map(r => PleromaAPI.Converter.relationship(r))
        })
      })
  }

  public async searchAccount(
    q: string,
    options?: {
      following?: boolean
      resolve?: boolean
      limit?: number
      max_id?: string
      since_id?: string
    }
  ): Promise<Response<Array<Entity.Account>>> {
    let params = { q: q }
    if (options) {
      if (options.following !== undefined && options.following !== null) {
        params = Object.assign(params, {
          following: options.following
        })
      }
      if (options.resolve !== undefined && options.resolve !== null) {
        params = Object.assign(params, {
          resolve: options.resolve
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Account>>('/api/v1/accounts/search', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => PleromaAPI.Converter.account(a))
      })
    })
  }

  // ======================================
  // accounts/bookmarks
  // ======================================

  public async getBookmarks(options?: {
    limit?: number
    max_id?: string
    since_id?: string
    min_id?: string
  }): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (options) {
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          min_id: options.min_id
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Status>>('/api/v1/bookmarks', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => PleromaAPI.Converter.status(s))
      })
    })
  }

  // ======================================
  //  accounts/favourites
  // ======================================

  public async getFavourites(options?: { limit?: number; max_id?: string; min_id?: string }): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (options) {
      if (options.min_id) {
        params = Object.assign(params, {
          min_id: options.min_id
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Status>>('/api/v1/favourites', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => PleromaAPI.Converter.status(s))
      })
    })
  }

  // ======================================
  // accounts/mutes
  // ======================================

  public async getMutes(options?: { limit?: number; max_id?: string; min_id?: string }): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (options) {
      if (options.min_id) {
        params = Object.assign(params, {
          min_id: options.min_id
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Account>>('/api/v1/mutes', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => PleromaAPI.Converter.account(a))
      })
    })
  }

  // ======================================
  // accounts/blocks
  // ======================================

  public async getBlocks(options?: { limit?: number; max_id?: string; min_id?: string }): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (options) {
      if (options.min_id) {
        params = Object.assign(params, {
          min_id: options.min_id
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Account>>('/api/v1/blocks', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => PleromaAPI.Converter.account(a))
      })
    })
  }

  // ======================================
  // accounts/domain_blocks
  // ======================================
  public async getDomainBlocks(options?: { limit?: number; max_id?: string; min_id?: string }): Promise<Response<Array<string>>> {
    let params = {}
    if (options) {
      if (options.min_id) {
        params = Object.assign(params, {
          min_id: options.min_id
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.get<Array<string>>('/api/v1/domain_blocks', params)
  }

  public blockDomain(domain: string): Promise<Response<{}>> {
    return this.client.post<{}>('/api/v1/domain_blocks', {
      domain: domain
    })
  }

  public unblockDomain(domain: string): Promise<Response<{}>> {
    return this.client.del<{}>('/api/v1/domain_blocks', {
      domain: domain
    })
  }

  // ======================================
  // accounts/filters
  // ======================================

  public async getFilters(): Promise<Response<Array<Entity.Filter>>> {
    return this.client.get<Array<PleromaAPI.Entity.Filter>>('/api/v1/filters').then(res => {
      return Object.assign(res, {
        data: res.data.map(f => PleromaAPI.Converter.filter(f))
      })
    })
  }

  public async getFilter(id: string): Promise<Response<Entity.Filter>> {
    return this.client.get<PleromaAPI.Entity.Filter>(`/api/v1/filters/${id}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.filter(res.data)
      })
    })
  }

  public async createFilter(
    phrase: string,
    context: Array<Entity.FilterContext>,
    options?: {
      irreversible?: boolean
      whole_word?: boolean
      expires_in?: string
    }
  ): Promise<Response<Entity.Filter>> {
    let params = {
      phrase: phrase,
      context: context
    }
    if (options) {
      if (options.irreversible !== undefined) {
        params = Object.assign(params, {
          irreversible: options.irreversible
        })
      }
      if (options.whole_word !== undefined) {
        params = Object.assign(params, {
          whole_word: options.whole_word
        })
      }
      if (options.expires_in) {
        params = Object.assign(params, {
          expires_in: options.expires_in
        })
      }
    }
    return this.client.post<PleromaAPI.Entity.Filter>('/api/v1/filters', params).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.filter(res.data)
      })
    })
  }

  public async updateFilter(
    id: string,
    phrase: string,
    context: Array<Entity.FilterContext>,
    options?: {
      irreversible?: boolean
      whole_word?: boolean
      expires_in?: string
    }
  ): Promise<Response<Entity.Filter>> {
    let params = {
      phrase: phrase,
      context: context
    }
    if (options) {
      if (options.irreversible !== undefined) {
        params = Object.assign(params, {
          irreversible: options.irreversible
        })
      }
      if (options.whole_word !== undefined) {
        params = Object.assign(params, {
          whole_word: options.whole_word
        })
      }
      if (options.expires_in) {
        params = Object.assign(params, {
          expires_in: options.expires_in
        })
      }
    }
    return this.client.put<PleromaAPI.Entity.Filter>(`/api/v1/filters/${id}`, params).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.filter(res.data)
      })
    })
  }

  public async deleteFilter(id: string): Promise<Response<Entity.Filter>> {
    return this.client.del<PleromaAPI.Entity.Filter>(`/api/v1/filters/${id}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.filter(res.data)
      })
    })
  }

  // ======================================
  // accounts/reports
  // ======================================
  public async report(
    account_id: string,
    comment: string,
    options?: {
      status_ids?: Array<string>

      forward?: boolean
    }
  ): Promise<Response<Entity.Report>> {
    let params = {
      account_id: account_id,
      comment: comment
    }
    if (options) {
      if (options.status_ids) {
        params = Object.assign(params, {
          status_ids: options.status_ids
        })
      }
      if (options.forward !== undefined) {
        params = Object.assign(params, {
          forward: options.forward
        })
      }
    }
    return this.client.post<PleromaAPI.Entity.Report>('/api/v1/reports', params).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.report(res.data)
      })
    })
  }

  // ======================================
  // accounts/follow_requests
  // ======================================
  public async getFollowRequests(limit?: number): Promise<Response<Array<Entity.Account>>> {
    if (limit) {
      return this.client
        .get<Array<PleromaAPI.Entity.Account>>('/api/v1/follow_requests', {
          limit: limit
        })
        .then(res => {
          return Object.assign(res, {
            data: res.data.map(a => PleromaAPI.Converter.account(a))
          })
        })
    } else {
      return this.client.get<Array<PleromaAPI.Entity.Account>>('/api/v1/follow_requests').then(res => {
        return Object.assign(res, {
          data: res.data.map(a => PleromaAPI.Converter.account(a))
        })
      })
    }
  }

  public async acceptFollowRequest(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<PleromaAPI.Entity.Relationship>(`/api/v1/follow_requests/${id}/authorize`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.relationship(res.data)
      })
    })
  }

  public async rejectFollowRequest(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<PleromaAPI.Entity.Relationship>(`/api/v1/follow_requests/${id}/reject`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.relationship(res.data)
      })
    })
  }

  // ======================================
  // accounts/endorsements
  // ======================================
  public async getEndorsements(options?: { limit?: number; max_id?: string; since_id?: string }): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Account>>('/api/v1/endorsements', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => PleromaAPI.Converter.account(a))
      })
    })
  }

  // ======================================
  // accounts/featured_tags
  // ======================================
  public async getFeaturedTags(): Promise<Response<Array<Entity.FeaturedTag>>> {
    return this.client.get<Array<PleromaAPI.Entity.FeaturedTag>>('/api/v1/featured_tags').then(res => {
      return Object.assign(res, {
        data: res.data.map(f => PleromaAPI.Converter.featured_tag(f))
      })
    })
  }

  public async createFeaturedTag(name: string): Promise<Response<Entity.FeaturedTag>> {
    return this.client
      .post<PleromaAPI.Entity.FeaturedTag>('/api/v1/featured_tags', {
        name: name
      })
      .then(res => {
        return Object.assign(res, {
          data: PleromaAPI.Converter.featured_tag(res.data)
        })
      })
  }

  public deleteFeaturedTag(id: string): Promise<Response<{}>> {
    return this.client.del<{}>(`/api/v1/featured_tags/${id}`)
  }

  public async getSuggestedTags(): Promise<Response<Array<Entity.Tag>>> {
    return this.client.get<Array<PleromaAPI.Entity.Tag>>('/api/v1/featured_tags/suggestions').then(res => {
      return Object.assign(res, {
        data: res.data.map(t => PleromaAPI.Converter.tag(t))
      })
    })
  }

  // ======================================
  // accounts/preferences
  // ======================================
  public async getPreferences(): Promise<Response<Entity.Preferences>> {
    return this.client.get<PleromaAPI.Entity.Preferences>('/api/v1/preferences').then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.preferences(res.data)
      })
    })
  }

  // ======================================
  // accounts/suggestions
  // ======================================
  public async getSuggestions(limit?: number): Promise<Response<Array<Entity.Account>>> {
    if (limit) {
      return this.client
        .get<Array<PleromaAPI.Entity.Account>>('/api/v1/suggestions', {
          limit: limit
        })
        .then(res => {
          return Object.assign(res, {
            data: res.data.map(a => PleromaAPI.Converter.account(a))
          })
        })
    } else {
      return this.client.get<Array<PleromaAPI.Entity.Account>>('/api/v1/suggestions').then(res => {
        return Object.assign(res, {
          data: res.data.map(a => PleromaAPI.Converter.account(a))
        })
      })
    }
  }

  // ======================================
  // statuses
  // ======================================
  public async postStatus(
    status: string,
    options: {
      media_ids?: Array<string>
      poll?: { options: Array<string>; expires_in: number; multiple?: boolean; hide_totals?: boolean }
      in_reply_to_id?: string
      sensitive?: boolean
      spoiler_text?: string
      visibility?: 'public' | 'unlisted' | 'private' | 'direct'
      scheduled_at?: string
      language?: string
    }
  ): Promise<Response<Entity.Status>> {
    let params = {
      status: status
    }
    if (options) {
      if (options.media_ids) {
        params = Object.assign(params, {
          media_ids: options.media_ids
        })
      }
      if (options.poll) {
        let pollParam = {
          options: options.poll.options,
          expires_in: options.poll.expires_in
        }
        if (options.poll.multiple !== undefined) {
          pollParam = Object.assign(pollParam, {
            multiple: options.poll.multiple
          })
        }
        if (options.poll.hide_totals !== undefined) {
          pollParam = Object.assign(pollParam, {
            hide_totals: options.poll.hide_totals
          })
        }
        params = Object.assign(params, {
          poll: pollParam
        })
      }
      if (options.in_reply_to_id) {
        params = Object.assign(params, {
          in_reply_to_id: options.in_reply_to_id
        })
      }
      if (options.sensitive !== undefined) {
        params = Object.assign(params, {
          sensitive: options.sensitive
        })
      }
      if (options.spoiler_text) {
        params = Object.assign(params, {
          spoiler_text: options.spoiler_text
        })
      }
      if (options.visibility) {
        params = Object.assign(params, {
          visibility: options.visibility
        })
      }
      if (options.scheduled_at) {
        params = Object.assign(params, {
          scheduled_at: options.scheduled_at
        })
      }
      if (options.language) {
        params = Object.assign(params, {
          language: options.language
        })
      }
    }
    return this.client.post<PleromaAPI.Entity.Status>('/api/v1/statuses', params).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  public async getStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.get<PleromaAPI.Entity.Status>(`/api/v1/statuses/${id}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  public async deleteStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.del<PleromaAPI.Entity.Status>(`/api/v1/statuses/${id}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  public async getStatusContext(
    id: string,
    options?: { limit?: number; max_id?: string; since_id?: string }
  ): Promise<Response<Entity.Context>> {
    let params = {}
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
    }
    return this.client.get<PleromaAPI.Entity.Context>(`/api/v1/statuses/${id}/context`, params).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.context(res.data)
      })
    })
  }

  public async getStatusRebloggedBy(id: string): Promise<Response<Array<Entity.Account>>> {
    return this.client.get<Array<PleromaAPI.Entity.Account>>(`/api/v1/statuses/${id}/reblogged_by`).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => PleromaAPI.Converter.account(a))
      })
    })
  }

  public async getStatusFavouritedBy(id: string): Promise<Response<Array<Entity.Account>>> {
    return this.client.get<Array<PleromaAPI.Entity.Account>>(`/api/v1/statuses/${id}/favourited_by`).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => PleromaAPI.Converter.account(a))
      })
    })
  }

  public async favouriteStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<PleromaAPI.Entity.Status>(`/api/v1/statuses/${id}/favourite`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  public async unfavouriteStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<PleromaAPI.Entity.Status>(`/api/v1/statuses/${id}/unfavourite`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  public async reblogStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<PleromaAPI.Entity.Status>(`/api/v1/statuses/${id}/reblog`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  public async unreblogStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<PleromaAPI.Entity.Status>(`/api/v1/statuses/${id}/unreblog`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  public async bookmarkStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<PleromaAPI.Entity.Status>(`/api/v1/statuses/${id}/bookmark`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  public async unbookmarkStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<PleromaAPI.Entity.Status>(`/api/v1/statuses/${id}/unbookmark`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  public async muteStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<PleromaAPI.Entity.Status>(`/api/v1/statuses/${id}/mute`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  public async unmuteStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<PleromaAPI.Entity.Status>(`/api/v1/statuses/${id}/unmute`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  public async pinStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<PleromaAPI.Entity.Status>(`/api/v1/statuses/${id}/pin`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  public async unpinStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<PleromaAPI.Entity.Status>(`/api/v1/statuses/${id}/unpin`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  // ======================================
  // statuses/media
  // ======================================
  public async uploadMedia(
    file: any,
    options?: { description?: string; focus?: string }
  ): Promise<Response<Entity.Attachment | Entity.AsyncAttachment>> {
    const formData = new FormData()
    formData.append('file', file)
    if (options) {
      if (options.description) {
        formData.append('description', options.description)
      }
      if (options.focus) {
        formData.append('focus', options.focus)
      }
    }
    return this.client.postForm<PleromaAPI.Entity.AsyncAttachment>('/api/v2/media', formData).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.async_attachment(res.data)
      })
    })
  }

  public async getMedia(id: string): Promise<Response<Entity.Attachment>> {
    const res = await this.client.get<PleromaAPI.Entity.Attachment>(`/api/v1/media/${id}`)

    return Object.assign(res, {
      data: PleromaAPI.Converter.attachment(res.data)
    })
  }

  public async updateMedia(
    id: string,
    options?: {
      file?: any
      description?: string
      focus?: string
    }
  ): Promise<Response<Entity.Attachment>> {
    const formData = new FormData()
    if (options) {
      if (options.file) {
        formData.append('file', options.file)
      }
      if (options.description) {
        formData.append('description', options.description)
      }
      if (options.focus) {
        formData.append('focus', options.focus)
      }
    }
    return this.client.putForm<PleromaAPI.Entity.Attachment>(`/api/v1/media/${id}`, formData).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.attachment(res.data)
      })
    })
  }

  // ======================================
  // statuses/polls
  // ======================================
  public async getPoll(id: string): Promise<Response<Entity.Poll>> {
    return this.client.get<PleromaAPI.Entity.Poll>(`/api/v1/polls/${id}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.poll(res.data)
      })
    })
  }

  public async votePoll(id: string, choices: Array<number>): Promise<Response<Entity.Poll>> {
    return this.client
      .post<PleromaAPI.Entity.Poll>(`/api/v1/polls/${id}/votes`, {
        choices: choices
      })
      .then(res => {
        return Object.assign(res, {
          data: PleromaAPI.Converter.poll(res.data)
        })
      })
  }

  // ======================================
  // statuses/scheduled_statuses
  // ======================================
  public async getScheduledStatuses(options?: {
    limit?: number | null
    max_id?: string | null
    since_id?: string | null
    min_id?: string | null
  }): Promise<Response<Array<Entity.ScheduledStatus>>> {
    let params = {}
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          min_id: options.min_id
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.ScheduledStatus>>('/api/v1/scheduled_statuses', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => PleromaAPI.Converter.scheduled_status(s))
      })
    })
  }

  public async getScheduledStatus(id: string): Promise<Response<Entity.ScheduledStatus>> {
    return this.client.get<PleromaAPI.Entity.ScheduledStatus>(`/api/v1/scheduled_statuses/${id}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.scheduled_status(res.data)
      })
    })
  }

  public async scheduleStatus(id: string, scheduled_at?: string | null): Promise<Response<Entity.ScheduledStatus>> {
    let params = {}
    if (scheduled_at) {
      params = Object.assign(params, {
        scheduled_at: scheduled_at
      })
    }
    return this.client.put<PleromaAPI.Entity.ScheduledStatus>(`/api/v1/scheduled_statuses/${id}`, params).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.scheduled_status(res.data)
      })
    })
  }

  public cancelScheduledStatus(id: string): Promise<Response<{}>> {
    return this.client.del<{}>(`/api/v1/scheduled_statuses/${id}`)
  }

  // ======================================
  // timelines
  // ======================================
  public async getPublicTimeline(options?: {
    only_media?: boolean
    limit?: number
    max_id?: string
    since_id?: string
    min_id?: string
  }): Promise<Response<Array<Entity.Status>>> {
    let params = {
      local: false
    }
    if (options) {
      if (options.only_media !== undefined) {
        params = Object.assign(params, {
          only_media: options.only_media
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          min_id: options.min_id
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Status>>('/api/v1/timelines/public', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => PleromaAPI.Converter.status(s))
      })
    })
  }

  public async getLocalTimeline(options?: {
    only_media?: boolean
    limit?: number
    max_id?: string
    since_id?: string
    min_id?: string
  }): Promise<Response<Array<Entity.Status>>> {
    let params = {
      local: true
    }
    if (options) {
      if (options.only_media !== undefined) {
        params = Object.assign(params, {
          only_media: options.only_media
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          min_id: options.min_id
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Status>>('/api/v1/timelines/public', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => PleromaAPI.Converter.status(s))
      })
    })
  }

  public async getTagTimeline(
    hashtag: string,
    options?: {
      local?: boolean
      only_media?: boolean
      limit?: number
      max_id?: string
      since_id?: string
      min_id?: string
    }
  ): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (options) {
      if (options.local !== undefined) {
        params = Object.assign(params, {
          local: options.local
        })
      }
      if (options.only_media !== undefined) {
        params = Object.assign(params, {
          only_media: options.only_media
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          min_id: options.min_id
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Status>>(`/api/v1/timelines/tag/${hashtag}`, params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => PleromaAPI.Converter.status(s))
      })
    })
  }

  public async getHomeTimeline(options?: {
    local?: boolean
    limit?: number
    max_id?: string
    since_id?: string
    min_id?: string
  }): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (options) {
      if (options.local !== undefined) {
        params = Object.assign(params, {
          local: options.local
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          min_id: options.min_id
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Status>>('/api/v1/timelines/home', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => PleromaAPI.Converter.status(s))
      })
    })
  }

  public async getListTimeline(
    list_id: string,
    options?: {
      limit?: number
      max_id?: string
      since_id?: string
      min_id?: string
    }
  ): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (options) {
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          min_id: options.min_id
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Status>>(`/api/v1/timelines/list/${list_id}`, params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => PleromaAPI.Converter.status(s))
      })
    })
  }

  // ======================================
  // timelines/conversations
  // ======================================
  public async getConversationTimeline(options?: {
    limit?: number
    max_id?: string
    since_id?: string
    min_id?: string
  }): Promise<Response<Array<Entity.Conversation>>> {
    let params = {}
    if (options) {
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          min_id: options.min_id
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Conversation>>('/api/v1/conversations', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(c => PleromaAPI.Converter.conversation(c))
      })
    })
  }

  public deleteConversation(id: string): Promise<Response<{}>> {
    return this.client.del<{}>(`/api/v1/conversations/${id}`)
  }

  public async readConversation(id: string): Promise<Response<Entity.Conversation>> {
    return this.client.post<PleromaAPI.Entity.Conversation>(`/api/v1/conversations/${id}/read`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.conversation(res.data)
      })
    })
  }

  // ======================================
  // timelines/lists
  // ======================================
  public async getLists(): Promise<Response<Array<Entity.List>>> {
    return this.client.get<Array<PleromaAPI.Entity.List>>('/api/v1/lists').then(res => {
      return Object.assign(res, {
        data: res.data.map(l => PleromaAPI.Converter.list(l))
      })
    })
  }

  public async getList(id: string): Promise<Response<Entity.List>> {
    return this.client.get<PleromaAPI.Entity.List>(`/api/v1/lists/${id}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.list(res.data)
      })
    })
  }

  public async createList(title: string): Promise<Response<Entity.List>> {
    return this.client
      .post<PleromaAPI.Entity.List>('/api/v1/lists', {
        title: title
      })
      .then(res => {
        return Object.assign(res, {
          data: PleromaAPI.Converter.list(res.data)
        })
      })
  }

  public async updateList(id: string, title: string): Promise<Response<Entity.List>> {
    return this.client
      .put<PleromaAPI.Entity.List>(`/api/v1/lists/${id}`, {
        title: title
      })
      .then(res => {
        return Object.assign(res, {
          data: PleromaAPI.Converter.list(res.data)
        })
      })
  }

  public deleteList(id: string): Promise<Response<{}>> {
    return this.client.del<{}>(`/api/v1/lists/${id}`)
  }

  public async getAccountsInList(
    id: string,
    options?: {
      limit?: number
      max_id?: string
      since_id?: string
    }
  ): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Account>>(`/api/v1/lists/${id}/accounts`, params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => PleromaAPI.Converter.account(a))
      })
    })
  }

  public addAccountsToList(id: string, account_ids: Array<string>): Promise<Response<{}>> {
    return this.client.post<{}>(`/api/v1/lists/${id}/accounts`, {
      account_ids: account_ids
    })
  }

  public deleteAccountsFromList(id: string, account_ids: Array<string>): Promise<Response<{}>> {
    return this.client.del<{}>(`/api/v1/lists/${id}/accounts`, {
      account_ids: account_ids
    })
  }

  // ======================================
  // timelines/markers
  // ======================================
  public async getMarkers(timeline: Array<string>): Promise<Response<Entity.Marker | {}>> {
    return this.client.get<PleromaAPI.Entity.Marker | {}>('/api/v1/markers', {
      timeline: timeline
    })
  }

  public async saveMarkers(options?: {
    home?: { last_read_id: string }
    notifications?: { last_read_id: string }
  }): Promise<Response<Entity.Marker>> {
    let params = {}
    if (options) {
      if (options.home) {
        params = Object.assign(params, {
          home: options.home
        })
      }
      if (options.notifications) {
        params = Object.assign(params, {
          notifications: options.notifications
        })
      }
    }
    return this.client.post<PleromaAPI.Entity.Marker>('/api/v1/markers', params).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.marker(res.data)
      })
    })
  }

  // ======================================
  // notifications
  // ======================================
  public async getNotifications(options?: {
    limit?: number
    max_id?: string
    since_id?: string
    min_id?: string
    exclude_types?: Array<Entity.NotificationType>
    account_id?: string
  }): Promise<Response<Array<Entity.Notification>>> {
    let params = {}
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          min_id: options.min_id
        })
      }
      if (options.exclude_types) {
        params = Object.assign(params, {
          exclude_types: options.exclude_types.map(e => PleromaAPI.Converter.encodeNotificationType(e))
        })
      }
      if (options.account_id) {
        params = Object.assign(params, {
          account_id: options.account_id
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Notification>>('/api/v1/notifications', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(n => PleromaAPI.Converter.notification(n))
      })
    })
  }

  public async getNotification(id: string): Promise<Response<Entity.Notification>> {
    return this.client.get<PleromaAPI.Entity.Notification>(`/api/v1/notifications/${id}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.notification(res.data)
      })
    })
  }

  public dismissNotifications(): Promise<Response<{}>> {
    return this.client.post<{}>('/api/v1/notifications/clear')
  }

  public dismissNotification(id: string): Promise<Response<{}>> {
    return this.client.post<{}>(`/api/v1/notifications/${id}/dismiss`)
  }

  public async readNotifications(options: {
    id?: string
    max_id?: string
  }): Promise<Response<Entity.Notification | Array<Entity.Notification>>> {
    if (options.id) {
      return this.client
        .post<PleromaAPI.Entity.Notification>('/api/v1/pleroma/notifications/read', {
          id: options.id
        })
        .then(res => {
          return Object.assign(res, {
            data: PleromaAPI.Converter.notification(res.data)
          })
        })
    } else if (options.max_id) {
      return this.client
        .post<Array<PleromaAPI.Entity.Notification>>('/api/v1/pleroma/notifications/read', {
          max_id: options.max_id
        })
        .then(res => {
          return Object.assign(res, {
            data: res.data.map(n => PleromaAPI.Converter.notification(n))
          })
        })
    } else {
      return new Promise((_, reject) => {
        const err = new ArgumentError('id or max_id is required')
        reject(err)
      })
    }
  }

  // ======================================
  // notifications/push
  // ======================================
  public async subscribePushNotification(
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    data?: { alerts: { follow?: boolean; favourite?: boolean; reblog?: boolean; mention?: boolean; poll?: boolean } } | null
  ): Promise<Response<Entity.PushSubscription>> {
    let params = {
      subscription
    }
    if (data) {
      params = Object.assign(params, {
        data
      })
    }
    return this.client.post<PleromaAPI.Entity.PushSubscription>('/api/v1/push/subscription', params).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.push_subscription(res.data)
      })
    })
  }

  public async getPushSubscription(): Promise<Response<Entity.PushSubscription>> {
    return this.client.get<PleromaAPI.Entity.PushSubscription>('/api/v1/push/subscription').then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.push_subscription(res.data)
      })
    })
  }

  public async updatePushSubscription(
    data?: { alerts: { follow?: boolean; favourite?: boolean; reblog?: boolean; mention?: boolean; poll?: boolean } } | null
  ): Promise<Response<Entity.PushSubscription>> {
    let params = {}
    if (data) {
      params = Object.assign(params, {
        data
      })
    }
    return this.client.put<PleromaAPI.Entity.PushSubscription>('/api/v1/push/subscription', params).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.push_subscription(res.data)
      })
    })
  }

  public deletePushSubscription(): Promise<Response<{}>> {
    return this.client.del<{}>('/api/v1/push/subscription')
  }

  // ======================================
  // search
  // ======================================
  public async search(
    q: string,
    type: 'accounts' | 'hashtags' | 'statuses',
    options?: {
      limit?: number
      max_id?: string
      min_id?: string
      resolve?: boolean
      offset?: number
      following?: boolean
      account_id?: string
      exclude_unreviewed?: boolean
    }
  ): Promise<Response<Entity.Results>> {
    let params = {
      q,
      type
    }
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          min_id: options.min_id
        })
      }
      if (options.resolve !== undefined) {
        params = Object.assign(params, {
          resolve: options.resolve
        })
      }
      if (options.offset) {
        params = Object.assign(params, {
          offset: options.offset
        })
      }
      if (options.following !== undefined) {
        params = Object.assign(params, {
          following: options.following
        })
      }
      if (options.account_id) {
        params = Object.assign(params, {
          account_id: options.account_id
        })
      }
      if (options.exclude_unreviewed) {
        params = Object.assign(params, {
          exclude_unreviewed: options.exclude_unreviewed
        })
      }
    }
    return this.client.get<PleromaAPI.Entity.Results>('/api/v2/search', params).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.results(res.data)
      })
    })
  }

  // ======================================
  // instance
  // ======================================
  public async getInstance(): Promise<Response<Entity.Instance>> {
    return this.client.get<PleromaAPI.Entity.Instance>('/api/v1/instance').then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.instance(res.data)
      })
    })
  }

  public getInstancePeers(): Promise<Response<Array<string>>> {
    return this.client.get<Array<string>>('/api/v1/instance/peers')
  }

  public async getInstanceActivity(): Promise<Response<Array<Entity.Activity>>> {
    return this.client.get<Array<PleromaAPI.Entity.Activity>>('/api/v1/instance/activity').then(res => {
      return Object.assign(res, {
        data: res.data.map(a => PleromaAPI.Converter.activity(a))
      })
    })
  }

  // ======================================
  // instance/trends
  // ======================================
  /**
   * GET /api/v1/trends
   *
   * @param limit Maximum number of results to return. Defaults to 10.
   */
  public async getInstanceTrends(limit?: number | null): Promise<Response<Array<Entity.Tag>>> {
    let params = {}
    if (limit) {
      params = Object.assign(params, {
        limit
      })
    }
    return this.client.get<Array<PleromaAPI.Entity.Tag>>('/api/v1/trends', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(t => PleromaAPI.Converter.tag(t))
      })
    })
  }

  // ======================================
  // instance/directory
  // ======================================
  public async getInstanceDirectory(options?: {
    limit?: number
    offset?: number
    order?: 'active' | 'new'
    local?: boolean
  }): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.offset) {
        params = Object.assign(params, {
          offset: options.offset
        })
      }
      if (options.order) {
        params = Object.assign(params, {
          order: options.order
        })
      }
      if (options.local !== undefined) {
        params = Object.assign(params, {
          local: options.local
        })
      }
    }
    return this.client.get<Array<PleromaAPI.Entity.Account>>('/api/v1/directory', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => PleromaAPI.Converter.account(a))
      })
    })
  }

  // ======================================
  // instance/custom_emojis
  // ======================================
  public async getInstanceCustomEmojis(): Promise<Response<Array<Entity.Emoji>>> {
    return this.client.get<Array<PleromaAPI.Entity.Emoji>>('/api/v1/custom_emojis').then(res => {
      return Object.assign(res, {
        data: res.data.map(e => PleromaAPI.Converter.emoji(e))
      })
    })
  }

  // ======================================
  // Emoji reactions
  // ======================================
  /**
   * PUT /api/v1/pleroma/statuses/:status_id/reactions/:emoji
   *
   * @param {string} id Target status ID.
   * @param {string} emoji Reaction emoji string. This string is raw unicode emoji.
   */
  public async createEmojiReaction(id: string, emoji: string): Promise<Response<Entity.Status>> {
    return this.client.put<PleromaAPI.Entity.Status>(`/api/v1/pleroma/statuses/${id}/reactions/${encodeURI(emoji)}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  /**
   * DELETE /api/v1/pleroma/statuses/:status_id/reactions/:emoji
   *
   * @param {string} id Target status ID.
   * @param {string} emoji Reaction emoji string. This string is raw unicode emoji.
   */
  public async deleteEmojiReaction(id: string, emoji: string): Promise<Response<Entity.Status>> {
    return this.client.del<PleromaAPI.Entity.Status>(`/api/v1/pleroma/statuses/${id}/reactions/${encodeURI(emoji)}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  /**
   * GET /api/v1/pleroma/statuses/:status_id/reactions
   *
   * @param {string} id Target status ID.
   */
  public async getEmojiReactions(id: string): Promise<Response<Array<Entity.Reaction>>> {
    return this.client.get<Array<PleromaAPI.Entity.Reaction>>(`/api/v1/pleroma/statuses/${id}/reactions`).then(res => {
      return Object.assign(res, {
        data: res.data.map(r => PleromaAPI.Converter.reaction(r))
      })
    })
  }

  /**
   * GET /api/v1/pleroma/statuses/:status_id/reactions/:emoji
   *
   * @param {string} id Target status ID.
   * @param {string} emoji Reaction emoji string. This string is url encoded unicode emoji.
   */
  public async getEmojiReaction(id: string, emoji: string): Promise<Response<Entity.Reaction>> {
    return this.client.get<PleromaAPI.Entity.Reaction>(`/api/v1/pleroma/statuses/${id}/reactions/${encodeURI(emoji)}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.reaction(res.data)
      })
    })
  }

  // ======================================
  // WebSocket
  // ======================================
  public userSocket(): WebSocket {
    return this.client.socket('/api/v1/streaming', 'user')
  }

  public publicSocket(): WebSocket {
    return this.client.socket('/api/v1/streaming', 'public')
  }

  public localSocket(): WebSocket {
    return this.client.socket('/api/v1/streaming', 'public:local')
  }

  public tagSocket(tag: string): WebSocket {
    return this.client.socket('/api/v1/streaming', 'hashtag', `tag=${tag}`)
  }

  public listSocket(list_id: string): WebSocket {
    return this.client.socket('/api/v1/streaming', 'list', `list=${list_id}`)
  }

  public directSocket(): WebSocket {
    return this.client.socket('/api/v1/streaming', 'direct')
  }
}
