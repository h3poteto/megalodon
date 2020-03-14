import { OAuth2 } from 'oauth'
import MastodonAPI from './mastodon/api_client'
import { ProxyConfig } from './proxy_config'
import OAuth from './oauth'
import Response from './response'
import WebSocket from './mastodon/web_socket'
import { MegalodonInterface, StreamListenerInterface, NoImplementedError } from './megalodon'
import Entity from './entity'
import { NO_REDIRECT, DEFAULT_SCOPE, DEFAULT_UA } from './default'

export default class Mastodon implements MegalodonInterface {
  public client: MastodonAPI.Client
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
    this.client = new MastodonAPI.Client(baseUrl, token, agent, proxyConfig)
    this.baseUrl = baseUrl
  }

  public cancel(): void {
    return this.client.cancel()
  }

  public async registerApp(
    client_name: string,
    options: Partial<{ scopes: Array<string>; redirect_uris: string; website: string }> = {
      scopes: DEFAULT_SCOPE,
      redirect_uris: NO_REDIRECT
    }
  ): Promise<OAuth.AppData> {
    return this.createApp(client_name, options).then(async appData => {
      return this.generateAuthUrl(appData.client_id, appData.client_secret, {
        scope: options.scopes,
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
    options: Partial<{ scopes: Array<string>; redirect_uris: string; website: string }> = {
      redirect_uris: NO_REDIRECT,
      scopes: DEFAULT_SCOPE
    }
  ): Promise<OAuth.AppData> {
    const redirect_uris = options.redirect_uris || NO_REDIRECT
    const scopes = options.scopes || DEFAULT_SCOPE

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
    options: Partial<{ scope: Array<string>; redirect_uri: string }> = {
      redirect_uri: NO_REDIRECT,
      scope: DEFAULT_SCOPE
    }
  ): Promise<string> {
    return new Promise(resolve => {
      const oauth = new OAuth2(clientId, clientSecret, this.baseUrl, undefined, '/oauth/token')
      const url = oauth.getAuthorizeUrl({
        redirect_uri: options.redirect_uri,
        response_type: 'code',
        client_id: clientId,
        scope: options.scope!.join(',')
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
    client_id: string,
    client_secret: string,
    code: string,
    redirect_uri = NO_REDIRECT
  ): Promise<OAuth.TokenData> {
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
    return this.client.post<MastodonAPI.Entity.Token>('/api/v1/accounts', params).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.token(res.data)
      })
    })
  }

  public async verifyAccountCredentials(): Promise<Response<Entity.Account>> {
    return this.client.get<MastodonAPI.Entity.Account>('/api/v1/accounts/verify_credentials').then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.account(res.data)
      })
    })
  }

  public async updateCredentials(
    discoverable?: boolean | null,
    bot?: boolean | null,
    display_name?: string | null,
    note?: string | null,
    avatar?: string | null,
    header?: string | null,
    locked?: boolean | null,
    source?: {
      privacy?: string
      sensitive?: boolean
      language?: string
    } | null,
    fields_attributes?: Array<{ name: string; value: string }>
  ): Promise<Response<Entity.Account>> {
    let params = {}
    if (discoverable !== null) {
      params = Object.assign(params, {
        discoverable: discoverable
      })
    }
    if (bot !== null) {
      params = Object.assign(params, {
        bot: bot
      })
    }
    if (display_name) {
      params = Object.assign(params, {
        display_name: display_name
      })
    }
    if (note) {
      params = Object.assign(params, {
        note: note
      })
    }
    if (avatar) {
      params = Object.assign(params, {
        avatar: avatar
      })
    }
    if (header) {
      params = Object.assign(params, {
        header: header
      })
    }
    if (locked !== null) {
      params = Object.assign(params, {
        locked: locked
      })
    }
    if (source) {
      params = Object.assign(params, {
        source: source
      })
    }
    if (fields_attributes) {
      params = Object.assign(params, {
        fields_attributes: fields_attributes
      })
    }
    return this.client.patch<MastodonAPI.Entity.Account>('/api/v1/accounts/update_credentials', params).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.account(res.data)
      })
    })
  }

  public async getAccount(id: string): Promise<Response<Entity.Account>> {
    return this.client.get<MastodonAPI.Entity.Account>(`/api/v1/accounts/${id}`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.account(res.data)
      })
    })
  }

  public async getAccountStatuses(id: string): Promise<Response<Array<Entity.Status>>> {
    return this.client.get<Array<MastodonAPI.Entity.Status>>(`/api/v1/accounts/${id}/statuses`).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => MastodonAPI.Converter.status(s))
      })
    })
  }

  public subscribeAccount(_id: string): Promise<Response<Entity.Relationship>> {
    return new Promise((_, reject) => {
      const err = new NoImplementedError('mastodon does not support')
      reject(err)
    })
  }

  public unsubscribeAccount(_id: string): Promise<Response<Entity.Relationship>> {
    return new Promise((_, reject) => {
      const err = new NoImplementedError('mastodon does not support')
      reject(err)
    })
  }

  public getAccountFavourites(
    _id: string,
    _limit?: number | null,
    _max_id?: string | null,
    _since_id?: string | null
  ): Promise<Response<Array<Entity.Status>>> {
    return new Promise((_, reject) => {
      const err = new NoImplementedError('mastodon does not support')
      reject(err)
    })
  }

  public async getAccountFollowers(
    id: string,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null
  ): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id: since_id
      })
    }
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Account>>(`/api/v1/accounts/${id}/followers`, params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => MastodonAPI.Converter.account(a))
      })
    })
  }

  public async getAccountFollowing(
    id: string,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null
  ): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id: since_id
      })
    }
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    return this.client.get<Array<MastodonEntity.Account>>(`/api/v1/accounts/${id}/following`, params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => MastodonAPI.Converter.account(a))
      })
    })
  }

  public async getAccountLists(id: string): Promise<Response<Array<Entity.List>>> {
    return this.client.get<Array<MastodonAPI.Entity.List>>(`/api/v1/accounts/${id}/lists`).then(res => {
      return Object.assign(res, {
        data: res.data.map(l => MastodonAPI.Converter.list(l))
      })
    })
  }

  public async getIdentityProof(id: string): Promise<Response<Array<Entity.IdentityProof>>> {
    return this.client.get<Array<MastodonAPI.Entity.IdentityProof>>(`/api/v1/accounts/${id}/identity_proofs`).then(res => {
      return Object.assign(res, {
        data: res.data.map(i => MastodonAPI.Converter.identity_proof(i))
      })
    })
  }

  public async followAccount(id: string, reblog: boolean = true): Promise<Response<Entity.Relationship>> {
    return this.client
      .post<MastodonAPI.Entity.Relationship>(`/api/v1/accounts/${id}/follow`, {
        reblog: reblog
      })
      .then(res => {
        return Object.assign(res, {
          data: MastodonAPI.Converter.relationship(res.data)
        })
      })
  }

  public async unfollowAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<MastodonAPI.Entity.Relationship>(`/api/v1/accounts/${id}/unfollow`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.relationship(res.data)
      })
    })
  }

  public async blockAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<MastodonAPI.Entity.Relationship>(`/api/v1/accounts/${id}/block`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.relationship(res.data)
      })
    })
  }

  public async unblockAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<MastodonAPI.Entity.Relationship>(`/api/v1/accounts/${id}/unblock`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.relationship(res.data)
      })
    })
  }

  public async muteAccount(id: string, notifications: boolean = true): Promise<Response<Entity.Relationship>> {
    return this.client
      .post<MastodonAPI.Entity.Relationship>(`/api/v1/accounts/${id}/mute`, {
        notifications: notifications
      })
      .then(res => {
        return Object.assign(res, {
          data: MastodonAPI.Converter.relationship(res.data)
        })
      })
  }

  public async unmuteAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<MastodonAPI.Entity.Relationship>(`/api/v1/accounts/${id}/unmute`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.relationship(res.data)
      })
    })
  }

  public async pinAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<MastodonAPI.Entity.Relationship>(`/api/v1/accounts/${id}/pin`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.relationship(res.data)
      })
    })
  }

  public async unpinAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<MastodonAPI.Entity.Relationship>(`/api/v1/accounts/${id}/unpin`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.relationship(res.data)
      })
    })
  }

  public async getRelationship(ids: Array<string>): Promise<Response<Entity.Relationship>> {
    return this.client
      .get<MastodonAPI.Entity.Relationship>('/api/v1/accounts/relationships', {
        id: ids
      })
      .then(res => {
        return Object.assign(res, {
          data: MastodonAPI.Converter.relationship(res.data)
        })
      })
  }

  public async searchAccount(
    q: string,
    following: boolean,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null
  ): Promise<Response<Array<Entity.Account>>> {
    let params = { q: q, following: following }
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id: since_id
      })
    }
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Account>>('/api/v1/accounts/search', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => MastodonAPI.Converter.account(a))
      })
    })
  }

  // ======================================
  // accounts/bookmarks
  // ======================================

  public async getBookmarks(
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id: since_id
      })
    }
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    if (min_id) {
      params = Object.assign(params, {
        min_id: min_id
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Status>>('/api/v1/bookmarks', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => MastodonAPI.Converter.status(s))
      })
    })
  }

  // ======================================
  //  accounts/favourites
  // ======================================

  public async getFavourites(
    limit?: number | null,
    max_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (min_id) {
      params = Object.assign(params, {
        min_id: min_id
      })
    }
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Status>>('/api/v1/favourites', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => MastodonAPI.Converter.status(s))
      })
    })
  }

  // ======================================
  // accounts/mutes
  // ======================================

  public async getMutes(limit?: number | null, max_id?: string | null, min_id?: string | null): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (min_id) {
      params = Object.assign(params, {
        min_id: min_id
      })
    }
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Account>>('/api/v1/mutes', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => MastodonAPI.Converter.account(a))
      })
    })
  }

  // ======================================
  // accounts/blocks
  // ======================================

  public async getBlocks(limit?: number | null, max_id?: string | null, min_id?: string | null): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (min_id) {
      params = Object.assign(params, {
        min_id: min_id
      })
    }
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Account>>('/api/v1/blocks', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => MastodonAPI.Converter.account(a))
      })
    })
  }

  // ======================================
  // accounts/domain_blocks
  // ======================================
  public async getDomainBlocks(limit?: number | null, max_id?: string | null, min_id?: string | null): Promise<Response<Array<string>>> {
    let params = {}
    if (min_id) {
      params = Object.assign(params, {
        min_id: min_id
      })
    }
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
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
    return this.client.get<Array<MastodonAPI.Entity.Filter>>('/api/v1/filters').then(res => {
      return Object.assign(res, {
        data: res.data.map(f => MastodonAPI.Converter.filter(f))
      })
    })
  }

  public async getFilter(id: string): Promise<Response<Entity.Filter>> {
    return this.client.get<MastodonAPI.Entity.Filter>(`/api/v1/filters/${id}`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.filter(res.data)
      })
    })
  }

  public async createFilter(
    phrase: string,
    context: Array<'home' | 'notifications' | 'public' | 'thread'>,
    irreversible?: boolean | null,
    whole_word?: boolean | null,
    expires_in?: string | null
  ): Promise<Response<Entity.Filter>> {
    let params = {
      phrase: phrase,
      context: context
    }
    if (irreversible !== null) {
      params = Object.assign(params, {
        irreversible: irreversible
      })
    }
    if (whole_word !== null) {
      params = Object.assign(params, {
        whole_word: whole_word
      })
    }
    if (expires_in) {
      params = Object.assign(params, {
        expires_in: expires_in
      })
    }
    return this.client.post<MastodonAPI.Entity.Filter>('/api/v1/filters', params).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.filter(res.data)
      })
    })
  }

  public async updateFilter(
    id: string,
    phrase: string,
    context: Array<'home' | 'notifications' | 'public' | 'thread'>,
    irreversible?: boolean | null,
    whole_word?: boolean | null,
    expires_in?: string | null
  ): Promise<Response<Entity.Filter>> {
    let params = {
      phrase: phrase,
      context: context
    }
    if (irreversible !== null) {
      params = Object.assign(params, {
        irreversible: irreversible
      })
    }
    if (whole_word !== null) {
      params = Object.assign(params, {
        whole_word: whole_word
      })
    }
    if (expires_in) {
      params = Object.assign(params, {
        expires_in: expires_in
      })
    }
    return this.client.post<MastodonAPI.Entity.Filter>(`/api/v1/filters/${id}`, params).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.filter(res.data)
      })
    })
  }

  public async deleteFilter(id: string): Promise<Response<Entity.Filter>> {
    return this.client.del<MastodonAPI.Entity.Filter>(`/api/v1/filters/${id}`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.filter(res.data)
      })
    })
  }

  // ======================================
  // accounts/reports
  // ======================================
  public async report(
    account_id: string,
    comment: string,
    status_ids?: Array<string> | null,

    forward?: boolean | null
  ): Promise<Response<Entity.Report>> {
    let params = {
      account_id: account_id,
      comment: comment
    }
    if (status_ids) {
      params = Object.assign(params, {
        status_ids: status_ids
      })
    }
    if (forward !== null) {
      params = Object.assign(params, {
        forward: forward
      })
    }
    return this.client.post<MastodonAPI.Entity.Report>('/api/v1/reports', params).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.report(res.data)
      })
    })
  }

  // ======================================
  // accounts/follow_requests
  // ======================================
  public async getFollowRequests(limit?: number): Promise<Response<Array<Entity.Account>>> {
    if (limit) {
      return this.client
        .get<Array<MastodonAPI.Entity.Account>>('/api/v1/follow_requests', {
          limit: limit
        })
        .then(res => {
          return Object.assign(res, {
            data: res.data.map(a => MastodonAPI.Converter.account(a))
          })
        })
    } else {
      return this.client.get<Array<MastodonAPI.Entity.Account>>('/api/v1/follow_requests').then(res => {
        return Object.assign(res, {
          data: res.data.map(a => MastodonAPI.Converter.account(a))
        })
      })
    }
  }

  public async acceptFollowRequest(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<MastodonAPI.Entity.Relationship>(`/api/v1/follow_requests/${id}/authorize`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.relationship(res.data)
      })
    })
  }

  public async rejectFollowRequest(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<MastodonAPI.Entity.Relationship>(`/api/v1/follow_requests/${id}/reject`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.relationship(res.data)
      })
    })
  }

  // ======================================
  // accounts/endorsements
  // ======================================
  public async getEndorsements(
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null
  ): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id: since_id
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Account>>('/api/v1/endorsements', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => MastodonAPI.Converter.account(a))
      })
    })
  }

  // ======================================
  // accounts/featured_tags
  // ======================================
  public async getFeaturedTags(): Promise<Response<Array<Entity.FeaturedTag>>> {
    return this.client.get<Array<MastodonAPI.Entity.FeaturedTag>>('/api/v1/featured_tags').then(res => {
      return Object.assign(res, {
        data: res.data.map(f => MastodonAPI.Converter.featured_tag(f))
      })
    })
  }

  public async createFeaturedTag(name: string): Promise<Response<Entity.FeaturedTag>> {
    return this.client
      .post<MastodonAPI.Entity.FeaturedTag>('/api/v1/featured_tags', {
        name: name
      })
      .then(res => {
        return Object.assign(res, {
          data: MastodonAPI.Converter.featured_tag(res.data)
        })
      })
  }

  public deleteFeaturedTag(id: string): Promise<Response<{}>> {
    return this.client.del<{}>(`/api/v1/featured_tags/${id}`)
  }

  public async getSuggestedTags(): Promise<Response<Array<Entity.Tag>>> {
    return this.client.get<Array<MastodonAPI.Entity.Tag>>('/api/v1/featured_tags/suggestions').then(res => {
      return Object.assign(res, {
        data: res.data.map(t => MastodonAPI.Converter.tag(t))
      })
    })
  }

  // ======================================
  // accounts/preferences
  // ======================================
  public async getPreferences(): Promise<Response<Entity.Preferences>> {
    return this.client.get<MastodonAPI.Entity.Preferences>('/api/v1/preferences').then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.preferences(res.data)
      })
    })
  }

  // ======================================
  // accounts/suggestions
  // ======================================
  public async getSuggestions(limit?: number): Promise<Response<Array<Entity.Account>>> {
    if (limit) {
      return this.client
        .get<Array<MastodonAPI.Entity.Account>>('/api/v1/suggestions', {
          limit: limit
        })
        .then(res => {
          return Object.assign(res, {
            data: res.data.map(a => MastodonAPI.Converter.account(a))
          })
        })
    } else {
      return this.client.get<Array<MastodonAPI.Entity.Account>>('/api/v1/suggestions').then(res => {
        return Object.assign(res, {
          data: res.data.map(a => MastodonAPI.Converter.account(a))
        })
      })
    }
  }

  // ======================================
  // statuses
  // ======================================
  public async postStatus(
    status: string,
    media_ids: Array<string> = [],
    poll?: { options: Array<string>; expires_in: number; multiple?: boolean; hide_totals?: boolean } | null,
    in_reply_to_id?: string | null,
    sensitive?: boolean | null,
    spoiler_text?: string | null,
    visibility?: 'public' | 'unlisted' | 'private' | 'direct' | null,
    scheduled_at?: string | null,
    language?: string | null
  ): Promise<Response<Entity.Status>> {
    let params = {
      status: status
    }
    if (media_ids.length > 0) {
      params = Object.assign(params, {
        media_ids: media_ids
      })
    }
    if (poll) {
      let pollParam = {
        options: poll.options,
        expires_in: poll.expires_in
      }
      if (poll.multiple !== undefined) {
        pollParam = Object.assign(pollParam, {
          multiple: poll.multiple
        })
      }
      if (poll.hide_totals) {
        pollParam = Object.assign(pollParam, {
          hide_totals: poll.hide_totals
        })
      }
      params = Object.assign(params, {
        poll: pollParam
      })
    }
    if (in_reply_to_id) {
      params = Object.assign(params, {
        in_reply_to_id: in_reply_to_id
      })
    }
    if (sensitive !== null) {
      params = Object.assign(params, {
        sensitive: sensitive
      })
    }
    if (spoiler_text) {
      params = Object.assign(params, {
        spoiler_text: spoiler_text
      })
    }
    if (visibility) {
      params = Object.assign(params, {
        visibility: visibility
      })
    }
    if (scheduled_at) {
      params = Object.assign(params, {
        scheduled_at: scheduled_at
      })
    }
    if (language) {
      params = Object.assign(params, {
        language: language
      })
    }
    return this.client.post<MastodonAPI.Entity.Status>('/api/v1/statuses', params).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.status(res.data)
      })
    })
  }

  public async getStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.get<MastodonAPI.Entity.Status>(`/api/v1/statuses/${id}`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.status(res.data)
      })
    })
  }

  public async deleteStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.del<MastodonAPI.Entity.Status>(`/api/v1/statuses/${id}`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.status(res.data)
      })
    })
  }

  public async getStatusContext(id: string): Promise<Response<Entity.Context>> {
    return this.client.get<MastodonAPI.Entity.Context>(`/api/v1/statuses/${id}/context`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.context(res.data)
      })
    })
  }

  public async getStatusRebloggedBy(id: string): Promise<Response<Array<Entity.Account>>> {
    return this.client.get<Array<MastodonAPI.Entity.Account>>(`/api/v1/statuses/${id}/reblogged_by`).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => MastodonAPI.Converter.account(a))
      })
    })
  }

  public async getStatusFavouritedBy(id: string): Promise<Response<Array<Entity.Account>>> {
    return this.client.get<Array<MastodonAPI.Entity.Account>>(`/api/v1/statuses/${id}/favourited_by`).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => MastodonAPI.Converter.account(a))
      })
    })
  }

  public async favouriteStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<MastodonAPI.Entity.Status>(`/api/v1/statuses/${id}/favourite`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.status(res.data)
      })
    })
  }

  public async unfavouriteStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<MastodonAPI.Entity.Status>(`/api/v1/statuses/${id}/unfavourite`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.status(res.data)
      })
    })
  }

  public async reblogStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<MastodonAPI.Entity.Status>(`/api/v1/statuses/${id}/reblog`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.status(res.data)
      })
    })
  }

  public async unreblogStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<MastodonAPI.Entity.Status>(`/api/v1/statuses/${id}/unreblog`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.status(res.data)
      })
    })
  }

  public async bookmarkStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<MastodonAPI.Entity.Status>(`/api/v1/statuses/${id}/bookmark`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.status(res.data)
      })
    })
  }

  public async unbookmarkStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<MastodonAPI.Entity.Status>(`/api/v1/statuses/${id}/unbookmark`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.status(res.data)
      })
    })
  }

  public async muteStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<MastodonAPI.Entity.Status>(`/api/v1/statuses/${id}/mute`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.status(res.data)
      })
    })
  }

  public async unmuteStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<MastodonAPI.Entity.Status>(`/api/v1/statuses/${id}/unmute`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.status(res.data)
      })
    })
  }

  public async pinStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<MastodonAPI.Entity.Status>(`/api/v1/statuses/${id}/pin`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.status(res.data)
      })
    })
  }

  public async unpinStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client.post<MastodonAPI.Entity.Status>(`/api/v1/statuses/${id}/unpin`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.status(res.data)
      })
    })
  }

  // ======================================
  // statuses/media
  // ======================================
  public async uploadMedia(file: any, description?: string | null, focus?: string | null): Promise<Response<Entity.Attachment>> {
    const formData = new FormData()
    formData.append('file', file)
    if (description) {
      formData.append('description', description)
    }
    if (focus) {
      formData.append('focus', focus)
    }
    return this.client.post<MastodonAPI.Entity.Attachment>('/api/v1/media', formData).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.attachment(res.data)
      })
    })
  }

  public async updateMedia(
    id: string,
    file?: any,
    description?: string | null,
    focus?: string | null
  ): Promise<Response<Entity.Attachment>> {
    let params = {}
    if (file) {
      params = Object.assign(params, {
        file: file
      })
    }
    if (description) {
      params = Object.assign(params, {
        description: description
      })
    }
    if (focus) {
      params = Object.assign(params, {
        focus: focus
      })
    }
    return this.client.put<MastodonAPI.Entity.Attachment>(`/api/v1/media/${id}`, params).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.attachment(res.data)
      })
    })
  }

  // ======================================
  // statuses/polls
  // ======================================
  public async getPoll(id: string): Promise<Response<Entity.Poll>> {
    return this.client.get<MastodonAPI.Entity.Poll>(`/api/v1/polls/${id}`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.poll(res.data)
      })
    })
  }

  public async votePoll(id: string, choices: Array<number>): Promise<Response<Entity.Poll>> {
    return this.client
      .post<MastodonAPI.Entity.Poll>(`/api/v1/polls/${id}/votes`, {
        choices: choices
      })
      .then(res => {
        return Object.assign(res, {
          data: MastodonAPI.Converter.poll(res.data)
        })
      })
  }

  // ======================================
  // statuses/scheduled_statuses
  // ======================================
  public async getScheduledStatuses(
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Entity.ScheduledStatus>>> {
    let params = {}
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id: since_id
      })
    }
    if (min_id) {
      params = Object.assign(params, {
        min_id: min_id
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.ScheduledStatus>>('/api/v1/scheduled_statuses', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => MastodonAPI.Converter.scheduled_status(s))
      })
    })
  }

  public async getScheduledStatus(id: string): Promise<Response<Entity.ScheduledStatus>> {
    return this.client.get<MastodonAPI.Entity.ScheduledStatus>(`/api/v1/scheduled_statuses/${id}`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.scheduled_status(res.data)
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
    return this.client.put<MastodonAPI.Entity.ScheduledStatus>(`/api/v1/scheduled_statuses/${id}`, params).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.scheduled_status(res.data)
      })
    })
  }

  public cancelScheduledStatus(id: string): Promise<Response<{}>> {
    return this.client.del<{}>(`/api/v1/scheduled_statuses/${id}`)
  }

  // ======================================
  // timelines
  // ======================================
  public async getPublicTimeline(
    only_media?: boolean | null,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Entity.Status>>> {
    let params = {
      local: false
    }
    if (only_media !== null) {
      params = Object.assign(params, {
        only_media: only_media
      })
    }
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id: since_id
      })
    }
    if (min_id) {
      params = Object.assign(params, {
        min_id: min_id
      })
    }
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Status>>('/api/v1/timelines/public', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => MastodonAPI.Converter.status(s))
      })
    })
  }

  public async getLocalTimeline(
    only_media?: boolean | null,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Entity.Status>>> {
    let params = {
      local: true
    }
    if (only_media !== null) {
      params = Object.assign(params, {
        only_media: only_media
      })
    }
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id: since_id
      })
    }
    if (min_id) {
      params = Object.assign(params, {
        min_id: min_id
      })
    }
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Status>>('/api/v1/timelines/public', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => MastodonAPI.Converter.status(s))
      })
    })
  }

  public async getTagTimeline(
    hashtag: string,
    local?: boolean | null,
    only_media?: boolean | null,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (local !== null) {
      params = Object.assign(params, {
        local: local
      })
    }
    if (only_media !== null) {
      params = Object.assign(params, {
        only_media: only_media
      })
    }
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id: since_id
      })
    }
    if (min_id) {
      params = Object.assign(params, {
        min_id: min_id
      })
    }
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Status>>(`/api/v1/timelines/tag/${hashtag}`, params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => MastodonAPI.Converter.status(s))
      })
    })
  }

  public async getHomeTimeline(
    local?: boolean | null,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (local !== null) {
      params = Object.assign(params, {
        local: local
      })
    }
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id: since_id
      })
    }
    if (min_id) {
      params = Object.assign(params, {
        min_id: min_id
      })
    }
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Status>>('/api/v1/timelines/home', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => MastodonAPI.Converter.status(s))
      })
    })
  }

  public async getListTimeline(
    list_id: string,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id: since_id
      })
    }
    if (min_id) {
      params = Object.assign(params, {
        min_id: min_id
      })
    }
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Status>>(`/api/v1/timelines/list/${list_id}`, params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => MastodonAPI.Converter.status(s))
      })
    })
  }

  // ======================================
  // timelines/conversations
  // ======================================
  public async getConversationTimeline(
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Entity.Conversation>>> {
    let params = {}
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id: since_id
      })
    }
    if (min_id) {
      params = Object.assign(params, {
        min_id: min_id
      })
    }
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Conversation>>('/api/v1/conversations', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(c => MastodonAPI.Converter.conversation(c))
      })
    })
  }

  public deleteConversation(id: string): Promise<Response<{}>> {
    return this.client.del<{}>(`/api/v1/conversations/${id}`)
  }

  public async readConversation(id: string): Promise<Response<Entity.Conversation>> {
    return this.client.post<MastodonAPI.Entity.Conversation>(`/api/v1/conversations/${id}/read`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.conversation(res.data)
      })
    })
  }

  // ======================================
  // timelines/lists
  // ======================================
  public async getLists(): Promise<Response<Array<Entity.List>>> {
    return this.client.get<Array<MastodonAPI.Entity.List>>('/api/v1/lists').then(res => {
      return Object.assign(res, {
        data: res.data.map(l => MastodonAPI.Converter.list(l))
      })
    })
  }

  public async getList(id: string): Promise<Response<Entity.List>> {
    return this.client.get<MastodonAPI.Entity.List>(`/api/v1/lists/${id}`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.list(res.data)
      })
    })
  }

  public async createList(title: string): Promise<Response<Entity.List>> {
    return this.client
      .post<MastodonAPI.Entity.List>('/api/v1/lists', {
        title: title
      })
      .then(res => {
        return Object.assign(res, {
          data: MastodonAPI.Converter.list(res.data)
        })
      })
  }

  public async updateList(id: string, title: string): Promise<Response<Entity.List>> {
    return this.client
      .put<MastodonAPI.Entity.List>(`/api/v1/lists/${id}`, {
        title: title
      })
      .then(res => {
        return Object.assign(res, {
          data: MastodonAPI.Converter.list(res.data)
        })
      })
  }

  public deleteList(id: string): Promise<Response<{}>> {
    return this.client.del<{}>(`/api/v1/lists/${id}`)
  }

  public async getAccountsInList(
    id: string,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null
  ): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id: since_id
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Account>>(`/api/v1/lists/${id}/accounts`, params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => MastodonAPI.Converter.account(a))
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
  public async getMarker(timeline: Array<'home' | 'notifications'>): Promise<Response<Entity.Marker | {}>> {
    return this.client.get<MastodonAPI.Entity.Marker | {}>('/api/v1/markers', {
      timeline: timeline
    })
  }

  public async saveMarker(
    home?: { last_read_id: string } | null,
    notifications?: { last_read_id: string } | null
  ): Promise<Response<Entity.Marker>> {
    let params = {}
    if (home) {
      params = Object.assign(params, {
        home: home
      })
    }
    if (notifications) {
      params = Object.assign(params, {
        notifications: notifications
      })
    }
    return this.client.post<MastodonAPI.Entity.Marker>('/api/v1/markers', params).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.marker(res.data)
      })
    })
  }

  // ======================================
  // notifications
  // ======================================
  public async getNotifications(
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null,
    exclude_type?: Array<'follow' | 'favourite' | 'reblog' | 'mention' | 'poll'> | null,
    account_id?: string | null
  ): Promise<Response<Array<Entity.Notification>>> {
    let params = {}
    if (limit) {
      params = Object.assign(params, {
        limit
      })
    }
    if (max_id) {
      params = Object.assign(params, {
        max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id
      })
    }
    if (min_id) {
      params = Object.assign(params, {
        min_id
      })
    }
    if (exclude_type) {
      params = Object.assign(params, {
        exclude_type
      })
    }
    if (account_id) {
      params = Object.assign(params, {
        account_id
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Notification>>('/api/v1/notifications', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(n => MastodonAPI.Converter.notification(n))
      })
    })
  }

  public async getNotification(id: string): Promise<Response<Entity.Notification>> {
    return this.client.get<MastodonAPI.Entity.Notification>(`/api/v1/notifications/${id}`).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.notification(res.data)
      })
    })
  }

  public dismissNotifications(): Promise<Response<{}>> {
    return this.client.post<{}>('/api/v1/notifications/clear')
  }

  public dismissNotification(id: string): Promise<Response<{}>> {
    return this.client.post<{}>(`/api/v1/notifications/${id}/dismiss`)
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
    return this.client.post<MastodonAPI.Entity.PushSubscription>('/api/v1/push/subscription', params).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.push_subscription(res.data)
      })
    })
  }

  public async getPushSubscription(): Promise<Response<Entity.PushSubscription>> {
    return this.client.get<MastodonAPI.Entity.PushSubscription>('/api/v1/push/subscription').then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.push_subscription(res.data)
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
    return this.client.put<MastodonAPI.Entity.PushSubscription>('/api/v1/push/subscription', params).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.push_subscription(res.data)
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
    limit?: number | null,
    max_id?: string | null,
    min_id?: string | null,
    resolve?: boolean | null,
    offset?: number | null,
    following?: boolean | null,
    account_id?: string | null,
    exclude_unreviewed?: boolean | null
  ): Promise<Response<Entity.Results>> {
    let params = {
      q,
      type
    }
    if (limit) {
      params = Object.assign(params, {
        limit
      })
    }
    if (max_id) {
      params = Object.assign(params, {
        max_id
      })
    }
    if (min_id) {
      params = Object.assign(params, {
        min_id
      })
    }
    if (resolve) {
      params = Object.assign(params, {
        resolve
      })
    }
    if (offset) {
      params = Object.assign(params, {
        offset
      })
    }
    if (following) {
      params = Object.assign(params, {
        following
      })
    }
    if (account_id) {
      params = Object.assign(params, {
        account_id
      })
    }
    if (exclude_unreviewed) {
      params = Object.assign(params, {
        exclude_unreviewed
      })
    }
    return this.client.get<MastodonAPI.Entity.Results>('/api/v2/search', params).then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.results(res.data)
      })
    })
  }

  // ======================================
  // instance
  // ======================================
  public async getInstance(): Promise<Response<Entity.Instance>> {
    return this.client.get<MastodonAPI.Entity.Instance>('/api/v1/instance').then(res => {
      return Object.assign(res, {
        data: MastodonAPI.Converter.instance(res.data)
      })
    })
  }

  public getInstancePeers(): Promise<Response<Array<string>>> {
    return this.client.get<Array<string>>('/api/v1/instance/peers')
  }

  public async getInstanceActivity(): Promise<Response<Array<Entity.Activity>>> {
    return this.client.get<Array<MastodonAPI.Entity.Activity>>('/api/v1/instance/activity').then(res => {
      return Object.assign(res, {
        data: res.data.map(a => MastodonAPI.Converter.activity(a))
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
    return this.client.get<Array<MastodonAPI.Entity.Tag>>('/api/v1/trends', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(t => MastodonAPI.Converter.tag(t))
      })
    })
  }

  // ======================================
  // instance/directory
  // ======================================
  public async getInstanceDirectory(
    limit?: number | null,
    offset?: number | null,
    order?: 'active' | 'new' | null,
    local?: boolean | null
  ): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (limit) {
      params = Object.assign(params, {
        limit
      })
    }
    if (offset) {
      params = Object.assign(params, {
        offset
      })
    }
    if (order) {
      params = Object.assign(params, {
        order
      })
    }
    if (local) {
      params = Object.assign(params, {
        local
      })
    }
    return this.client.get<Array<MastodonAPI.Entity.Account>>('/api/v1/directory', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(a => MastodonAPI.Converter.account(a))
      })
    })
  }

  // ======================================
  // instance/custom_emojis
  // ======================================
  public async getInstanceCustomEmojis(): Promise<Response<Array<Entity.Emoji>>> {
    return this.client.get<Array<MastodonAPI.Entity.Emoji>>('/api/v1/custom_emojis').then(res => {
      return Object.assign(res, {
        data: res.data.map(e => MastodonAPI.Converter.emoji(e))
      })
    })
  }

  // ======================================
  // HTTP Streaming
  // ======================================
  public userStream(): StreamListenerInterface {
    return this.client.stream('/api/v1/streaming/user')
  }

  public publicStream(): StreamListenerInterface {
    return this.client.stream('/api/v1/streaming/public')
  }

  public localStream(): StreamListenerInterface {
    return this.client.stream('/api/v1/streaming/public/local')
  }

  public tagStream(tag: string): StreamListenerInterface {
    return this.client.stream(`/api/v1/streaming/hashtag?tag=${tag}`)
  }

  public listStream(list_id: string): StreamListenerInterface {
    return this.client.stream(`/api/v1/streaming/list?list=${list_id}`)
  }

  public directStream(): StreamListenerInterface {
    return this.client.stream('/api/v1/streaming/direct')
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
