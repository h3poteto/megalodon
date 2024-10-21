import FormData from 'form-data'
import FirefishAPI from './firefish/api_client'
import { DEFAULT_UA } from './default'
import OAuth from './oauth'
import * as FirefishOAuth from './firefish/oauth'
import Response from './response'
import { MegalodonInterface, WebSocketInterface, NotImplementedError, ArgumentError, UnexpectedError } from './megalodon'
import { UnknownNotificationTypeError } from './notification'
import Entity from './entity'

export default class Firefish implements MegalodonInterface {
  public client: FirefishAPI.Interface
  public baseUrl: string

  /**
   * @param baseUrl hostname or base URL
   * @param accessToken access token from OAuth2 authorization
   * @param userAgent UserAgent is specified in header on request.
   */
  constructor(baseUrl: string, accessToken: string | null = null, userAgent: string | null = DEFAULT_UA) {
    let token: string = ''
    if (accessToken) {
      token = accessToken
    }
    let agent: string = DEFAULT_UA
    if (userAgent) {
      agent = userAgent
    }
    this.client = new FirefishAPI.Client(baseUrl, token, agent)
    this.baseUrl = baseUrl
  }

  public cancel(): void {
    return this.client.cancel()
  }

  public async registerApp(
    client_name: string,
    options: Partial<{ scopes: Array<string>; redirect_uris: string; website: string }> = {
      scopes: FirefishAPI.DEFAULT_SCOPE,
      redirect_uris: this.baseUrl
    }
  ): Promise<OAuth.AppData> {
    return this.createApp(client_name, options).then(async appData => {
      return this.generateAuthUrlAndToken(appData.client_secret).then(session => {
        appData.url = session.url
        appData.session_token = session.token
        return appData
      })
    })
  }

  /**
   * POST /api/app/create
   *
   * Create an application.
   * @param client_name Your application's name.
   * @param options Form data.
   */
  public async createApp(
    client_name: string,
    options: Partial<{ scopes: Array<string>; redirect_uris: string; website: string }> = {
      scopes: FirefishAPI.DEFAULT_SCOPE,
      redirect_uris: this.baseUrl
    }
  ): Promise<OAuth.AppData> {
    const redirect_uris = options.redirect_uris || this.baseUrl
    const scopes = options.scopes || FirefishAPI.DEFAULT_SCOPE

    const params: {
      name: string
      description: string
      permission: Array<string>
      callbackUrl: string
    } = {
      name: client_name,
      description: '',
      permission: scopes,
      callbackUrl: redirect_uris
    }

    /**
     * The response is:
     {
       "id": "xxxxxxxxxx",
       "name": "string",
       "callbackUrl": "string",
       "permission": [
         "string"
       ],
       "secret": "string"
     }
    */
    return this.client.post<FirefishOAuth.AppDataFromServer>('/api/app/create', params).then((res: Response<FirefishAPI.Entity.App>) => {
      return FirefishOAuth.toAppData(res.data)
    })
  }

  /**
   * POST /api/auth/session/generate
   */
  public async generateAuthUrlAndToken(clientSecret: string): Promise<FirefishAPI.Entity.Session> {
    return this.client
      .post<FirefishAPI.Entity.Session>('/api/auth/session/generate', {
        appSecret: clientSecret
      })
      .then((res: Response<FirefishAPI.Entity.Session>) => res.data)
  }

  // ======================================
  // apps
  // ======================================
  public async verifyAppCredentials(): Promise<Response<Entity.Application>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // apps/oauth
  // ======================================
  /**
   * POST /api/auth/session/userkey
   *
   * @param _client_id This parameter is not used in this method.
   * @param client_secret Application secret key which will be provided in createApp.
   * @param session_token Session token string which will be provided in generateAuthUrlAndToken.
   * @param _redirect_uri This parameter is not used in this method.
   */
  public async fetchAccessToken(
    _client_id: string | null,
    client_secret: string,
    session_token: string,
    _redirect_uri?: string
  ): Promise<OAuth.TokenData> {
    return this.client
      .post<FirefishOAuth.TokenDataFromServer>('/api/auth/session/userkey', {
        appSecret: client_secret,
        token: session_token
      })
      .then(res => {
        return FirefishOAuth.toTokenData(res.data)
      })
  }

  public async refreshToken(_client_id: string, _client_secret: string, _refresh_token: string): Promise<OAuth.TokenData> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async revokeToken(_client_id: string, _client_secret: string, _token: string): Promise<Response<Record<never, never>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // accounts
  // ======================================
  public async registerAccount(
    _username: string,
    _email: string,
    _password: string,
    _agreement: boolean,
    _locale: string,
    _reason?: string | null
  ): Promise<Response<Entity.Token>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  /**
   * POST /api/i
   */
  public async verifyAccountCredentials(): Promise<Response<Entity.Account>> {
    return this.client.post<FirefishAPI.Entity.UserDetail>('/api/i').then(res => {
      return Object.assign(res, {
        data: FirefishAPI.Converter.userDetail(res.data)
      })
    })
  }

  /**
   * POST /api/i/update
   */
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
    } | null
    fields_attributes?: Array<{ name: string; value: string }>
  }): Promise<Response<Entity.Account>> {
    let params = {}
    if (options) {
      if (options.bot !== undefined) {
        params = Object.assign(params, {
          isBot: options.bot
        })
      }
      if (options.display_name) {
        params = Object.assign(params, {
          name: options.display_name
        })
      }
      if (options.note) {
        params = Object.assign(params, {
          description: options.note
        })
      }
      if (options.locked !== undefined) {
        params = Object.assign(params, {
          isLocked: options.locked
        })
      }
      if (options.source) {
        if (options.source.language) {
          params = Object.assign(params, {
            lang: options.source.language
          })
        }
        if (options.source.sensitive) {
          params = Object.assign(params, {
            alwaysMarkNsfw: options.source.sensitive
          })
        }
      }
    }
    return this.client.post<FirefishAPI.Entity.UserDetail>('/api/i', params).then(res => {
      return Object.assign(res, {
        data: FirefishAPI.Converter.userDetail(res.data)
      })
    })
  }

  /**
   * POST /api/users/show
   */
  public async getAccount(id: string): Promise<Response<Entity.Account>> {
    return this.client
      .post<FirefishAPI.Entity.UserDetail>('/api/users/show', {
        userId: id
      })
      .then(res => {
        return Object.assign(res, {
          data: FirefishAPI.Converter.userDetail(res.data)
        })
      })
  }

  /**
   * POST /api/users/notes
   */
  public async getAccountStatuses(
    id: string,
    options?: {
      limit?: number
      max_id?: string
      since_id?: string
      pinned?: boolean
      exclude_replies: boolean
      exclude_reblogs: boolean
      only_media?: boolean
    }
  ): Promise<Response<Array<Entity.Status>>> {
    if (options && options.pinned) {
      return this.client
        .post<FirefishAPI.Entity.UserDetail>('/api/users/show', {
          userId: id
        })
        .then(res => {
          if (res.data.pinnedNotes) {
            return { ...res, data: res.data.pinnedNotes.map(n => FirefishAPI.Converter.note(n)) }
          }
          return { ...res, data: [] }
        })
    }

    let params = {
      userId: id
    }
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          untilId: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          sinceId: options.since_id
        })
      }
      if (options.exclude_replies) {
        params = Object.assign(params, {
          includeReplies: false
        })
      }
      if (options.exclude_reblogs) {
        params = Object.assign(params, {
          includeMyRenotes: false
        })
      }
      if (options.only_media) {
        params = Object.assign(params, {
          withFiles: options.only_media
        })
      }
    }
    return this.client.post<Array<FirefishAPI.Entity.Note>>('/api/users/notes', params).then(res => {
      const statuses: Array<Entity.Status> = res.data.map(note => FirefishAPI.Converter.note(note))
      return Object.assign(res, {
        data: statuses
      })
    })
  }

  public async getAccountFavourites(
    _id: string,
    _options?: {
      limit?: number
      max_id?: string
      since_id?: string
    }
  ): Promise<Response<Array<Entity.Status>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async subscribeAccount(_id: string): Promise<Response<Entity.Relationship>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async unsubscribeAccount(_id: string): Promise<Response<Entity.Relationship>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  /**
   * POST /api/users/followers
   */
  public async getAccountFollowers(
    id: string,
    options?: {
      limit?: number
      max_id?: string
      since_id?: string
    }
  ): Promise<Response<Array<Entity.Account>>> {
    let params = {
      userId: id
    }
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.post<Array<FirefishAPI.Entity.Follow>>('/api/users/followers', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(f => FirefishAPI.Converter.follower(f))
      })
    })
  }

  /**
   * POST /api/users/following
   */
  public async getAccountFollowing(
    id: string,
    options?: {
      limit?: number
      max_id?: string
      since_id?: string
    }
  ): Promise<Response<Array<Entity.Account>>> {
    let params = {
      userId: id
    }
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.post<Array<FirefishAPI.Entity.Follow>>('/api/users/following', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(f => FirefishAPI.Converter.following(f))
      })
    })
  }

  public async getAccountLists(_id: string): Promise<Response<Array<Entity.List>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async getIdentityProof(_id: string): Promise<Response<Array<Entity.IdentityProof>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  /**
   * POST /api/following/create
   */
  public async followAccount(id: string, _options?: { reblog?: boolean }): Promise<Response<Entity.Relationship>> {
    await this.client.post<Record<never, never>>('/api/following/create', {
      userId: id
    })
    return this.client
      .post<FirefishAPI.Entity.Relation>('/api/users/relation', {
        userId: id
      })
      .then(res => {
        return Object.assign(res, {
          data: FirefishAPI.Converter.relation(res.data)
        })
      })
  }

  /**
   * POST /api/following/delete
   */
  public async unfollowAccount(id: string): Promise<Response<Entity.Relationship>> {
    await this.client.post<Record<never, never>>('/api/following/delete', {
      userId: id
    })
    return this.client
      .post<FirefishAPI.Entity.Relation>('/api/users/relation', {
        userId: id
      })
      .then(res => {
        return Object.assign(res, {
          data: FirefishAPI.Converter.relation(res.data)
        })
      })
  }

  /**
   * POST /api/blocking/create
   */
  public async blockAccount(id: string): Promise<Response<Entity.Relationship>> {
    await this.client.post<Record<never, never>>('/api/blocking/create', {
      userId: id
    })
    return this.client
      .post<FirefishAPI.Entity.Relation>('/api/users/relation', {
        userId: id
      })
      .then(res => {
        return Object.assign(res, {
          data: FirefishAPI.Converter.relation(res.data)
        })
      })
  }

  /**
   * POST /api/blocking/delete
   */
  public async unblockAccount(id: string): Promise<Response<Entity.Relationship>> {
    await this.client.post<Record<never, never>>('/api/blocking/delete', {
      userId: id
    })
    return this.client
      .post<FirefishAPI.Entity.Relation>('/api/users/relation', {
        userId: id
      })
      .then(res => {
        return Object.assign(res, {
          data: FirefishAPI.Converter.relation(res.data)
        })
      })
  }

  /**
   * POST /api/mute/create
   */
  public async muteAccount(id: string, _notifications: boolean): Promise<Response<Entity.Relationship>> {
    await this.client.post<Record<never, never>>('/api/mute/create', {
      userId: id
    })
    return this.client
      .post<FirefishAPI.Entity.Relation>('/api/users/relation', {
        userId: id
      })
      .then(res => {
        return Object.assign(res, {
          data: FirefishAPI.Converter.relation(res.data)
        })
      })
  }

  /**
   * POST /api/mute/delete
   */
  public async unmuteAccount(id: string): Promise<Response<Entity.Relationship>> {
    await this.client.post<Record<never, never>>('/api/mute/delete', {
      userId: id
    })
    return this.client
      .post<FirefishAPI.Entity.Relation>('/api/users/relation', {
        userId: id
      })
      .then(res => {
        return Object.assign(res, {
          data: FirefishAPI.Converter.relation(res.data)
        })
      })
  }

  public async pinAccount(_id: string): Promise<Response<Entity.Relationship>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async unpinAccount(_id: string): Promise<Response<Entity.Relationship>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async setAccountNote(_id: string): Promise<Response<Entity.Relationship>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  /**
   * POST /api/users/relation
   *
   * @param id The accountID, for example `'1sdfag'`
   */
  public async getRelationship(id: string): Promise<Response<Entity.Relationship>> {
    return this.client
      .post<FirefishAPI.Entity.Relation>('/api/users/relation', {
        userId: id
      })
      .then(res => {
        return Object.assign(res, {
          data: FirefishAPI.Converter.relation(res.data)
        })
      })
  }

  /**
   * POST /api/users/relation
   *
   * @param id Array of account ID, for example `['1sdfag', 'ds12aa']`.
   */
  public async getRelationships(ids: Array<string>): Promise<Response<Array<Entity.Relationship>>> {
    return Promise.all(ids.map(id => this.getRelationship(id))).then(results => ({
      ...results[0],
      data: results.map(r => r.data)
    }))
  }

  /**
   * POST /api/users/search
   */
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
    let params = {
      query: q,
      detail: true
    }
    if (options) {
      if (options.resolve !== undefined) {
        params = Object.assign(params, {
          localOnly: options.resolve
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
    }
    return this.client.post<Array<FirefishAPI.Entity.UserDetail>>('/api/users/search', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(u => FirefishAPI.Converter.userDetail(u))
      })
    })
  }

  public async lookupAccount(_acct: string): Promise<Response<Entity.Account>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // accounts/bookmarks
  // ======================================
  public async getBookmarks(_options?: {
    limit?: number
    max_id?: string
    since_id?: string
    min_id?: string
  }): Promise<Response<Array<Entity.Status>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  //  accounts/favourites
  // ======================================
  /**
   * POST /api/i/favorites
   */
  public async getFavourites(options?: { limit?: number; max_id?: string; min_id?: string }): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          untilId: options.max_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          sinceId: options.min_id
        })
      }
    }
    return this.client.post<Array<FirefishAPI.Entity.Favorite>>('/api/i/favorites', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(fav => FirefishAPI.Converter.note(fav.note))
      })
    })
  }

  // ======================================
  // accounts/mutes
  // ======================================
  /**
   * POST /api/mute/list
   */
  public async getMutes(options?: { limit?: number; max_id?: string; min_id?: string }): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          untilId: options.max_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          sinceId: options.min_id
        })
      }
    }
    return this.client.post<Array<FirefishAPI.Entity.Mute>>('/api/mute/list', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(mute => FirefishAPI.Converter.userDetail(mute.mutee))
      })
    })
  }

  // ======================================
  // accounts/blocks
  // ======================================
  /**
   * POST /api/blocking/list
   */
  public async getBlocks(options?: { limit?: number; max_id?: string; min_id?: string }): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          untilId: options.max_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          sinceId: options.min_id
        })
      }
    }
    return this.client.post<Array<FirefishAPI.Entity.Blocking>>('/api/blocking/list', params).then(res => {
      return Object.assign(res, {
        data: res.data.map(blocking => FirefishAPI.Converter.userDetail(blocking.blockee))
      })
    })
  }

  // ======================================
  // accounts/domain_blocks
  // ======================================
  public async getDomainBlocks(_options?: { limit?: number; max_id?: string; min_id?: string }): Promise<Response<Array<string>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async blockDomain(_domain: string): Promise<Response<Record<never, never>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async unblockDomain(_domain: string): Promise<Response<Record<never, never>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // accounts/filters
  // ======================================
  public async getFilters(): Promise<Response<Array<Entity.Filter>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async getFilter(_id: string): Promise<Response<Entity.Filter>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async createFilter(
    _phrase: string,
    _context: Array<string>,
    _options?: {
      irreversible?: boolean
      whole_word?: boolean
      expires_in?: string
    }
  ): Promise<Response<Entity.Filter>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async updateFilter(
    _id: string,
    _phrase: string,
    _context: Array<string>,
    _options?: {
      irreversible?: boolean
      whole_word?: boolean
      expires_in?: string
    }
  ): Promise<Response<Entity.Filter>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async deleteFilter(_id: string): Promise<Response<Entity.Filter>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // accounts/reports
  // ======================================
  /**
   * POST /api/users/report-abuse
   */
  public async report(
    account_id: string,
    options: {
      status_ids?: Array<string>
      comment: string
      forward?: boolean
      category: Entity.Category
      rule_ids?: Array<number>
    }
  ): Promise<Response<Entity.Report>> {
    const category: Entity.Category = 'other'
    return this.client
      .post<Record<never, never>>('/api/users/report-abuse', {
        userId: account_id,
        comment: options.comment
      })
      .then(res => {
        return Object.assign(res, {
          data: {
            id: '',
            action_taken: false,
            action_taken_at: null,
            comment: options.comment,
            category: category,
            forwarded: false,
            status_ids: null,
            rule_ids: null
          }
        })
      })
  }

  // ======================================
  // accounts/follow_requests
  // ======================================
  /**
   * POST /api/following/requests/list
   */
  public async getFollowRequests(_limit?: number): Promise<Response<Array<Entity.Account>>> {
    return this.client.post<Array<FirefishAPI.Entity.FollowRequest>>('/api/following/requests/list').then(res => {
      return Object.assign(res, {
        data: res.data.map(r => FirefishAPI.Converter.user(r.follower))
      })
    })
  }

  /**
   * POST /api/following/requests/accept
   */
  public async acceptFollowRequest(id: string): Promise<Response<Entity.Relationship>> {
    await this.client.post<Record<never, never>>('/api/following/requests/accept', {
      userId: id
    })
    return this.client
      .post<FirefishAPI.Entity.Relation>('/api/users/relation', {
        userId: id
      })
      .then(res => {
        return Object.assign(res, {
          data: FirefishAPI.Converter.relation(res.data)
        })
      })
  }

  /**
   * POST /api/following/requests/reject
   */
  public async rejectFollowRequest(id: string): Promise<Response<Entity.Relationship>> {
    await this.client.post<Record<never, never>>('/api/following/requests/reject', {
      userId: id
    })
    return this.client
      .post<FirefishAPI.Entity.Relation>('/api/users/relation', {
        userId: id
      })
      .then(res => {
        return Object.assign(res, {
          data: FirefishAPI.Converter.relation(res.data)
        })
      })
  }

  // ======================================
  // accounts/endorsements
  // ======================================
  public async getEndorsements(_options?: {
    limit?: number
    max_id?: string
    since_id?: string
  }): Promise<Response<Array<Entity.Account>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // accounts/featured_tags
  // ======================================
  public async getFeaturedTags(): Promise<Response<Array<Entity.FeaturedTag>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async createFeaturedTag(_name: string): Promise<Response<Entity.FeaturedTag>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async deleteFeaturedTag(_id: string): Promise<Response<Record<never, never>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async getSuggestedTags(): Promise<Response<Array<Entity.Tag>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // accounts/preferences
  // ======================================
  public async getPreferences(): Promise<Response<Entity.Preferences>> {
    return this.client.post<FirefishAPI.Entity.UserDetailMe>('/api/i').then(async res => {
      return Object.assign(res, {
        data: FirefishAPI.Converter.userPreferences(res.data, await this.getDefaultPostPrivacy())
      })
    })
  }

  private async getDefaultPostPrivacy(): Promise<Entity.StatusVisibility> {
    return this.client
      .post<string>('/api/i/registry/get-unsecure', {
        key: 'defaultNoteVisibility',
        scope: ['client', 'base']
      })
      .then(res => {
        if (!res.data || (res.data != 'public' && res.data != 'home' && res.data != 'followers' && res.data != 'specified')) return 'public'
        return FirefishAPI.Converter.visibility(res.data)
      })
      .catch(_ => 'public')
  }

  // ======================================
  // accounts/followed_tags
  // ======================================
  public async getFollowedTags(): Promise<Response<Array<Entity.Tag>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // accounts/suggestions
  // ======================================
  /**
   * POST /api/users/recommendation
   */
  public async getSuggestions(limit?: number): Promise<Response<Array<Entity.Account>>> {
    let params = {}
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    return this.client
      .post<Array<FirefishAPI.Entity.UserDetail>>('/api/users/recommendation', params)
      .then(res => ({ ...res, data: res.data.map(u => FirefishAPI.Converter.userDetail(u)) }))
  }

  // ======================================
  // accounts/tags
  // ======================================
  public async getTag(_id: string): Promise<Response<Entity.Tag>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async followTag(_id: string): Promise<Response<Entity.Tag>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async unfollowTag(_id: string): Promise<Response<Entity.Tag>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // statuses
  // ======================================
  public async postStatus(
    status: string,
    options?: {
      media_ids?: Array<string>
      poll?: { options: Array<string>; expires_in: number; multiple?: boolean; hide_totals?: boolean }
      in_reply_to_id?: string
      sensitive?: boolean
      spoiler_text?: string
      visibility?: Entity.StatusVisibility
      scheduled_at?: string
      language?: string
      quote_id?: string
    }
  ): Promise<Response<Entity.Status>> {
    let params = {
      text: status
    }
    if (options) {
      if (options.media_ids) {
        params = Object.assign(params, {
          fileIds: options.media_ids
        })
      }
      if (options.poll) {
        let pollParam = {
          choices: options.poll.options,
          expiresAt: null,
          expiredAfter: options.poll.expires_in
        }
        if (options.poll.multiple !== undefined) {
          pollParam = Object.assign(pollParam, {
            multiple: options.poll.multiple
          })
        }
        params = Object.assign(params, {
          poll: pollParam
        })
      }
      if (options.in_reply_to_id) {
        params = Object.assign(params, {
          replyId: options.in_reply_to_id
        })
      }
      // TODO: This field should be applied to files#is_sensitive.
      // if (options.sensitive) {
      //   params = Object.assign(params, {
      //     cw: ''
      //   })
      // }
      if (options.spoiler_text) {
        params = Object.assign(params, {
          cw: options.spoiler_text
        })
      }
      if (options.visibility) {
        params = Object.assign(params, {
          visibility: FirefishAPI.Converter.encodeVisibility(options.visibility)
        })
      }
      if (options.quote_id) {
        params = Object.assign(params, {
          renoteId: options.quote_id
        })
      }
    }
    return this.client
      .post<FirefishAPI.Entity.CreatedNote>('/api/notes/create', params)
      .then(res => ({ ...res, data: FirefishAPI.Converter.note(res.data.createdNote) }))
  }

  /**
   * POST /api/notes/show
   */
  public async getStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client
      .post<FirefishAPI.Entity.Note>('/api/notes/show', {
        noteId: id
      })
      .then(res => ({ ...res, data: FirefishAPI.Converter.note(res.data) }))
  }

  public async editStatus(
    _id: string,
    _options: {
      status?: string
      spoiler_text?: string
      sensitive?: boolean
      media_ids?: Array<string>
      poll?: { options?: Array<string>; expires_in?: number; multiple?: boolean; hide_totals?: boolean }
    }
  ): Promise<Response<Entity.Status>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  /**
   * POST /api/notes/delete
   */
  public async deleteStatus(id: string): Promise<Response<Record<never, never>>> {
    return this.client.post<Record<never, never>>('/api/notes/delete', {
      noteId: id
    })
  }

  /**
   * POST /api/notes/children
   */
  public async getStatusContext(
    id: string,
    options?: { limit?: number; max_id?: string; since_id?: string }
  ): Promise<Response<Entity.Context>> {
    let params = {
      noteId: id
    }
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          untilId: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          sinceId: options.since_id
        })
      }
    }
    return this.client.post<Array<FirefishAPI.Entity.Note>>('/api/notes/children', params).then(res => {
      const context: Entity.Context = {
        ancestors: [],
        descendants: res.data.map(n => FirefishAPI.Converter.note(n))
      }
      return {
        ...res,
        data: context
      }
    })
  }

  public async getStatusSource(_id: string): Promise<Response<Entity.StatusSource>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  /**
   * POST /api/notes/renotes
   */
  public async getStatusRebloggedBy(id: string): Promise<Response<Array<Entity.Account>>> {
    return this.client
      .post<Array<FirefishAPI.Entity.Note>>('/api/notes/renotes', {
        noteId: id
      })
      .then(res => ({
        ...res,
        data: res.data.map(n => FirefishAPI.Converter.user(n.user))
      }))
  }

  public async getStatusFavouritedBy(_id: string): Promise<Response<Array<Entity.Account>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  /**
   * POST /api/notes/favorites/create
   */
  public async favouriteStatus(id: string): Promise<Response<Entity.Status>> {
    await this.client.post<Record<never, never>>('/api/notes/favorites/create', {
      noteId: id
    })
    return this.client
      .post<FirefishAPI.Entity.Note>('/api/notes/show', {
        noteId: id
      })
      .then(res => ({ ...res, data: FirefishAPI.Converter.note(res.data) }))
  }

  /**
   * POST /api/notes/favorites/delete
   */
  public async unfavouriteStatus(id: string): Promise<Response<Entity.Status>> {
    await this.client.post<Record<never, never>>('/api/notes/favorites/delete', {
      noteId: id
    })
    return this.client
      .post<FirefishAPI.Entity.Note>('/api/notes/show', {
        noteId: id
      })
      .then(res => ({ ...res, data: FirefishAPI.Converter.note(res.data) }))
  }

  /**
   * POST /api/notes/create
   */
  public async reblogStatus(id: string): Promise<Response<Entity.Status>> {
    return this.client
      .post<FirefishAPI.Entity.CreatedNote>('/api/notes/create', {
        renoteId: id
      })
      .then(res => ({ ...res, data: FirefishAPI.Converter.note(res.data.createdNote) }))
  }

  /**
   * POST /api/notes/unrenote
   */
  public async unreblogStatus(id: string): Promise<Response<Entity.Status>> {
    await this.client.post<Record<never, never>>('/api/notes/unrenote', {
      noteId: id
    })
    return this.client
      .post<FirefishAPI.Entity.Note>('/api/notes/show', {
        noteId: id
      })
      .then(res => ({ ...res, data: FirefishAPI.Converter.note(res.data) }))
  }

  public async bookmarkStatus(_id: string): Promise<Response<Entity.Status>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async unbookmarkStatus(_id: string): Promise<Response<Entity.Status>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async muteStatus(_id: string): Promise<Response<Entity.Status>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async unmuteStatus(_id: string): Promise<Response<Entity.Status>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  /**
   * POST /api/i/pin
   */
  public async pinStatus(id: string): Promise<Response<Entity.Status>> {
    await this.client.post<Record<never, never>>('/api/i/pin', {
      noteId: id
    })
    return this.client
      .post<FirefishAPI.Entity.Note>('/api/notes/show', {
        noteId: id
      })
      .then(res => ({ ...res, data: FirefishAPI.Converter.note(res.data) }))
  }

  /**
   * POST /api/i/unpin
   */
  public async unpinStatus(id: string): Promise<Response<Entity.Status>> {
    await this.client.post<Record<never, never>>('/api/i/unpin', {
      noteId: id
    })
    return this.client
      .post<FirefishAPI.Entity.Note>('/api/notes/show', {
        noteId: id
      })
      .then(res => ({ ...res, data: FirefishAPI.Converter.note(res.data) }))
  }

  /**
   * Convert a Unicode emoji or custom emoji name to a Firefish reaction.
   * @see Firefish's reaction-lib.ts
   */
  private reactionName(name: string): string {
    // See: https://github.com/tc39/proposal-regexp-unicode-property-escapes#matching-emoji
    const isUnicodeEmoji = /\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?|\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu.test(name)
    if (isUnicodeEmoji) {
      return name
    }
    return `:${name}:`
  }

  // ======================================
  // statuses/media
  // ======================================
  /**
   * POST /api/drive/files/create
   */
  public async uploadMedia(file: any, _options?: { description?: string; focus?: string }): Promise<Response<Entity.Attachment>> {
    const formData = new FormData()
    formData.append('file', file)
    let headers: { [key: string]: string } = {}
    if (typeof formData.getHeaders === 'function') {
      headers = formData.getHeaders()
    }
    return this.client
      .post<FirefishAPI.Entity.File>('/api/drive/files/create', formData, headers)
      .then(res => ({ ...res, data: FirefishAPI.Converter.file(res.data) }))
  }

  public async getMedia(id: string): Promise<Response<Entity.Attachment>> {
    const res = await this.client.post<FirefishAPI.Entity.File>('/api/drive/files/show', { fileId: id })
    return { ...res, data: FirefishAPI.Converter.file(res.data) }
  }

  /**
   * POST /api/drive/files/update
   */
  public async updateMedia(
    id: string,
    options?: {
      file?: any
      description?: string
      focus?: string
      is_sensitive?: boolean
    }
  ): Promise<Response<Entity.Attachment>> {
    let params = {
      fileId: id
    }
    if (options) {
      if (options.is_sensitive !== undefined) {
        params = Object.assign(params, {
          isSensitive: options.is_sensitive
        })
      }
    }
    return this.client
      .post<FirefishAPI.Entity.File>('/api/drive/files/update', params)
      .then(res => ({ ...res, data: FirefishAPI.Converter.file(res.data) }))
  }

  // ======================================
  // statuses/polls
  // ======================================
  public async getPoll(_id: string): Promise<Response<Entity.Poll>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  /**
   * POST /api/notes/polls/vote
   */
  public async votePoll(_id: string, choices: Array<number>, status_id?: string | null): Promise<Response<Entity.Poll>> {
    if (!status_id) {
      return new Promise((_, reject) => {
        const err = new ArgumentError('status_id is required')
        reject(err)
      })
    }
    const params = {
      noteId: status_id,
      choice: choices[0]
    }
    await this.client.post<Record<never, never>>('/api/notes/polls/vote', params)
    const res = await this.client
      .post<FirefishAPI.Entity.Note>('/api/notes/show', {
        noteId: status_id
      })
      .then(res => {
        const note = FirefishAPI.Converter.note(res.data)
        return { ...res, data: note.poll }
      })
    if (!res.data) {
      return new Promise((_, reject) => {
        const err = new UnexpectedError('poll does not exist')
        reject(err)
      })
    }
    return { ...res, data: res.data }
  }

  // ======================================
  // statuses/scheduled_statuses
  // ======================================
  public async getScheduledStatuses(_options?: {
    limit?: number
    max_id?: string
    since_id?: string
    min_id?: string
  }): Promise<Response<Array<Entity.ScheduledStatus>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async getScheduledStatus(_id: string): Promise<Response<Entity.ScheduledStatus>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async scheduleStatus(_id: string, _scheduled_at?: string | null): Promise<Response<Entity.ScheduledStatus>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async cancelScheduledStatus(_id: string): Promise<Response<Record<never, never>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // timelines
  // ======================================
  /**
   * POST /api/notes/global-timeline
   */
  public async getPublicTimeline(options?: {
    only_media?: boolean
    limit?: number
    max_id?: string
    since_id?: string
    min_id?: string
  }): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (options) {
      if (options.only_media !== undefined) {
        params = Object.assign(params, {
          withFiles: options.only_media
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          untilId: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          sinceId: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          sinceId: options.min_id
        })
      }
    }
    return this.client
      .post<Array<FirefishAPI.Entity.Note>>('/api/notes/global-timeline', params)
      .then(res => ({ ...res, data: res.data.map(n => FirefishAPI.Converter.note(n)) }))
  }

  /**
   * POST /api/notes/local-timeline
   */
  public async getLocalTimeline(options?: {
    only_media?: boolean
    limit?: number
    max_id?: string
    since_id?: string
    min_id?: string
  }): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (options) {
      if (options.only_media !== undefined) {
        params = Object.assign(params, {
          withFiles: options.only_media
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          untilId: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          sinceId: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          sinceId: options.min_id
        })
      }
    }
    return this.client
      .post<Array<FirefishAPI.Entity.Note>>('/api/notes/local-timeline', params)
      .then(res => ({ ...res, data: res.data.map(n => FirefishAPI.Converter.note(n)) }))
  }

  /**
   * POST /api/notes/search-by-tag
   */
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
    let params = {
      tag: hashtag
    }
    if (options) {
      if (options.only_media !== undefined) {
        params = Object.assign(params, {
          withFiles: options.only_media
        })
      }
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          untilId: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          sinceId: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          sinceId: options.min_id
        })
      }
    }
    return this.client
      .post<Array<FirefishAPI.Entity.Note>>('/api/notes/search-by-tag', params)
      .then(res => ({ ...res, data: res.data.map(n => FirefishAPI.Converter.note(n)) }))
  }

  /**
   * POST /api/notes/timeline
   */
  public async getHomeTimeline(options?: {
    local?: boolean
    limit?: number
    max_id?: string
    since_id?: string
    min_id?: string
  }): Promise<Response<Array<Entity.Status>>> {
    let params = {
      withFiles: false
    }
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          untilId: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          sinceId: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          sinceId: options.min_id
        })
      }
    }
    return this.client
      .post<Array<FirefishAPI.Entity.Note>>('/api/notes/timeline', params)
      .then(res => ({ ...res, data: res.data.map(n => FirefishAPI.Converter.note(n)) }))
  }

  /**
   * POST /api/notes/user-list-timeline
   */
  public async getListTimeline(
    list_id: string,
    options?: {
      limit?: number
      max_id?: string
      since_id?: string
      min_id?: string
    }
  ): Promise<Response<Array<Entity.Status>>> {
    let params = {
      listId: list_id,
      withFiles: false
    }
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          untilId: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          sinceId: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          sinceId: options.min_id
        })
      }
    }
    return this.client
      .post<Array<FirefishAPI.Entity.Note>>('/api/notes/user-list-timeline', params)
      .then(res => ({ ...res, data: res.data.map(n => FirefishAPI.Converter.note(n)) }))
  }

  // ======================================
  // timelines/conversations
  // ======================================
  /**
   * POST /api/notes/mentions
   */
  public async getConversationTimeline(options?: {
    limit?: number
    max_id?: string
    since_id?: string
    min_id?: string
  }): Promise<Response<Array<Entity.Conversation>>> {
    let params = {
      visibility: 'specified'
    }
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          untilId: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          sinceId: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          sinceId: options.min_id
        })
      }
    }
    return this.client
      .post<Array<FirefishAPI.Entity.Note>>('/api/notes/mentions', params)
      .then(res => ({ ...res, data: res.data.map(n => FirefishAPI.Converter.noteToConversation(n)) }))
  }

  public async deleteConversation(_id: string): Promise<Response<Record<never, never>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async readConversation(_id: string): Promise<Response<Entity.Conversation>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // timelines/lists
  // ======================================
  /**
   * POST /api/users/lists/list
   */
  public async getLists(): Promise<Response<Array<Entity.List>>> {
    return this.client
      .post<Array<FirefishAPI.Entity.List>>('/api/users/lists/list')
      .then(res => ({ ...res, data: res.data.map(l => FirefishAPI.Converter.list(l)) }))
  }

  /**
   * POST /api/users/lists/show
   */
  public async getList(id: string): Promise<Response<Entity.List>> {
    return this.client
      .post<FirefishAPI.Entity.List>('/api/users/lists/show', {
        listId: id
      })
      .then(res => ({ ...res, data: FirefishAPI.Converter.list(res.data) }))
  }

  /**
   * POST /api/users/lists/create
   */
  public async createList(title: string): Promise<Response<Entity.List>> {
    return this.client
      .post<FirefishAPI.Entity.List>('/api/users/lists/create', {
        name: title
      })
      .then(res => ({ ...res, data: FirefishAPI.Converter.list(res.data) }))
  }

  /**
   * POST /api/users/lists/update
   */
  public async updateList(id: string, title: string): Promise<Response<Entity.List>> {
    return this.client
      .post<FirefishAPI.Entity.List>('/api/users/lists/update', {
        listId: id,
        name: title
      })
      .then(res => ({ ...res, data: FirefishAPI.Converter.list(res.data) }))
  }

  /**
   * POST /api/users/lists/delete
   */
  public async deleteList(id: string): Promise<Response<Record<never, never>>> {
    return this.client.post<Record<never, never>>('/api/users/lists/delete', {
      listId: id
    })
  }

  /**
   * POST /api/users/lists/show
   */
  public async getAccountsInList(
    id: string,
    _options?: {
      limit?: number
      max_id?: string
      since_id?: string
    }
  ): Promise<Response<Array<Entity.Account>>> {
    const res = await this.client.post<FirefishAPI.Entity.List>('/api/users/lists/show', {
      listId: id
    })
    const promise = res.data.userIds?.map(userId => this.getAccount(userId))
    if (promise) {
      const accounts = await Promise.all(promise)
      return { ...res, data: accounts.map(r => r.data) }
    } else {
      return { ...res, data: [] }
    }
  }

  /**
   * POST /api/users/lists/push
   */
  public async addAccountsToList(id: string, account_ids: Array<string>): Promise<Response<Record<never, never>>> {
    return this.client.post<Record<never, never>>('/api/users/lists/push', {
      listId: id,
      userId: account_ids[0]
    })
  }

  /**
   * POST /api/users/lists/pull
   */
  public async deleteAccountsFromList(id: string, account_ids: Array<string>): Promise<Response<Record<never, never>>> {
    return this.client.post<Record<never, never>>('/api/users/lists/pull', {
      listId: id,
      userId: account_ids[0]
    })
  }

  // ======================================
  // timelines/markers
  // ======================================
  public async getMarkers(_timeline: Array<string>): Promise<Response<Entity.Marker | Record<never, never>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async saveMarkers(_options?: {
    home?: { last_read_id: string }
    notifications?: { last_read_id: string }
  }): Promise<Response<Entity.Marker>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // notifications
  // ======================================
  /**
   * POST /api/i/notifications
   */
  public async getNotifications(options?: {
    limit?: number
    max_id?: string
    since_id?: string
    min_id?: string
    exclude_type?: Array<Entity.NotificationType>
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
          untilId: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          sinceId: options.since_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          sinceId: options.min_id
        })
      }
      if (options.exclude_type) {
        params = Object.assign(params, {
          excludeType: options.exclude_type.map(e => FirefishAPI.Converter.encodeNotificationType(e))
        })
      }
    }
    const res = await this.client.post<Array<FirefishAPI.Entity.Notification>>('/api/i/notifications', params)
    const notifications: Array<Entity.Notification> = res.data.flatMap(n => {
      const notify = FirefishAPI.Converter.notification(n)
      if (notify instanceof UnknownNotificationTypeError) {
        return []
      }
      return notify
    })

    return { ...res, data: notifications }
  }

  public async getNotification(_id: string): Promise<Response<Entity.Notification>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  /**
   * POST /api/notifications/mark-all-as-read
   */
  public async dismissNotifications(): Promise<Response<Record<never, never>>> {
    return this.client.post<Record<never, never>>('/api/notifications/mark-all-as-read')
  }

  public async dismissNotification(_id: string): Promise<Response<Record<never, never>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async readNotifications(_options: { id?: string; max_id?: string }): Promise<Response<{}>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('mastodon does not support')
      reject(err)
    })
  }

  // ======================================
  // notifications/push
  // ======================================
  public async subscribePushNotification(
    _subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    _data?: { alerts: { follow?: boolean; favourite?: boolean; reblog?: boolean; mention?: boolean; poll?: boolean } } | null
  ): Promise<Response<Entity.PushSubscription>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async getPushSubscription(): Promise<Response<Entity.PushSubscription>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async updatePushSubscription(
    _data?: { alerts: { follow?: boolean; favourite?: boolean; reblog?: boolean; mention?: boolean; poll?: boolean } } | null
  ): Promise<Response<Entity.PushSubscription>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  /**
   * DELETE /api/v1/push/subscription
   */
  public async deletePushSubscription(): Promise<Response<Record<never, never>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // search
  // ======================================
  private async searchAccounts(
    q: string,
    options?: {
      type: 'accounts' | 'hashtags' | 'statuses'
      limit?: number
      max_id?: string
      min_id?: string
      resolve?: boolean
      offset?: number
      following?: boolean
      account_id?: string
      exclude_unreviewed?: boolean
    }
  ): Promise<Array<FirefishAPI.Entity.UserDetail>> {
    let params = {
      query: q
    }
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
      if (options.resolve) {
        params = Object.assign(params, {
          localOnly: options.resolve
        })
      }
    }
    const res = await this.client.post<Array<FirefishAPI.Entity.UserDetail>>('/api/users/search', params)
    return res.data
  }

  private async searchStatuses(
    q: string,
    options?: {
      type: 'accounts' | 'hashtags' | 'statuses'
      limit?: number
      max_id?: string
      min_id?: string
      resolve?: boolean
      offset?: number
      following?: boolean
      account_id?: string
      exclude_unreviewed?: boolean
    }
  ): Promise<Array<FirefishAPI.Entity.Note>> {
    let params = {
      query: q
    }
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
      if (options.max_id) {
        params = Object.assign(params, {
          untilId: options.max_id
        })
      }
      if (options.min_id) {
        params = Object.assign(params, {
          sinceId: options.min_id
        })
      }
      if (options.account_id) {
        params = Object.assign(params, {
          userId: options.account_id
        })
      }
    }
    const res = await this.client.post<Array<FirefishAPI.Entity.Note>>('/api/notes/search', params)
    return res.data
  }

  private async searchHashtags(
    q: string,
    options?: {
      type: 'accounts' | 'hashtags' | 'statuses'
      limit?: number
      max_id?: string
      min_id?: string
      resolve?: boolean
      offset?: number
      following?: boolean
      account_id?: string
      exclude_unreviewed?: boolean
    }
  ): Promise<Array<string>> {
    let params = {
      query: q
    }
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
    }
    const res = await this.client.post<Array<string>>('/api/hashtags/search', params)
    return res.data
  }

  private async searchAll(
    q: string,
    options?: {
      type: 'accounts' | 'hashtags' | 'statuses'
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
    let accounts: Array<FirefishAPI.Entity.UserDetail> = []
    try {
      accounts = await this.searchAccounts(q, options)
    } catch (e) {
      console.warn(e)
    }
    let statuses: Array<FirefishAPI.Entity.Note> = []
    try {
      statuses = await this.searchStatuses(q, options)
    } catch (e) {
      console.warn(e)
    }
    let hashtags: Array<string> = []
    try {
      hashtags = await this.searchHashtags(q, options)
    } catch (e) {
      console.warn(e)
    }

    return {
      data: {
        accounts: accounts.map(a => FirefishAPI.Converter.userDetail(a)),
        statuses: statuses.map(n => FirefishAPI.Converter.note(n)),
        hashtags: hashtags.map(h => ({ name: h, url: h, history: [], following: false }))
      },
      status: 200,
      statusText: '200',
      headers: null
    }
  }

  public async search(
    q: string,
    options?: {
      type: 'accounts' | 'hashtags' | 'statuses'
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
    if (options) {
      switch (options.type) {
        case 'accounts': {
          const accounts = await this.searchAccounts(q, options)
          return {
            data: {
              accounts: accounts.map(a => FirefishAPI.Converter.userDetail(a)),
              statuses: [],
              hashtags: []
            },
            status: 200,
            statusText: '200',
            headers: null
          }
        }
        case 'statuses': {
          const statuses = await this.searchStatuses(q, options)
          return {
            data: {
              accounts: [],
              statuses: statuses.map(n => FirefishAPI.Converter.note(n)),
              hashtags: []
            },
            status: 200,
            statusText: '200',
            headers: null
          }
        }
        case 'hashtags': {
          const hashtags = await this.searchHashtags(q, options)
          return {
            data: {
              accounts: [],
              statuses: [],
              hashtags: hashtags.map(h => ({ name: h, url: h, history: [], following: false }))
            },
            status: 200,
            statusText: '200',
            headers: null
          }
        }
        default: {
          return this.searchAll(q, options)
        }
      }
    } else {
      return this.searchAll(q)
    }
  }

  // ======================================
  // instance
  // ======================================
  /**
   * POST /api/meta
   * POST /api/stats
   */
  public async getInstance(): Promise<Response<Entity.Instance>> {
    return this.client
      .get<FirefishAPI.Entity.Instance>('/api/v1/instance')
      .then(res => ({ ...res, data: FirefishAPI.Converter.instance(res.data) }))
  }

  public async getInstancePeers(): Promise<Response<Array<string>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async getInstanceActivity(): Promise<Response<Array<Entity.Activity>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // instance/trends
  // ======================================
  /**
   * POST /api/hashtags/trend
   */
  public async getInstanceTrends(_limit?: number | null): Promise<Response<Array<Entity.Tag>>> {
    return this.client
      .post<Array<FirefishAPI.Entity.Hashtag>>('/api/hashtags/trend')
      .then(res => ({ ...res, data: res.data.map(h => FirefishAPI.Converter.hashtag(h)) }))
  }

  // ======================================
  // instance/directory
  // ======================================
  public async getInstanceDirectory(_options?: {
    limit?: number
    offset?: number
    order?: 'active' | 'new'
    local?: boolean
  }): Promise<Response<Array<Entity.Account>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // instance/custom_emojis
  // ======================================
  /**
   * GET /api/meta
   */
  public async getInstanceCustomEmojis(): Promise<Response<Array<Entity.Emoji>>> {
    return this.client
      .post<FirefishAPI.Entity.Meta>('/api/meta')
      .then(res => ({ ...res, data: res.data.emojis.map(e => FirefishAPI.Converter.emoji(e)) }))
  }

  // ======================================
  // instance/announcements
  // ======================================
  /**
   * GET /api/announcements
   *
   * @return Array of announcements.
   */
  public async getInstanceAnnouncements(): Promise<Response<Array<Entity.Announcement>>> {
    return this.client
      .post<Array<FirefishAPI.Entity.Announcement>>('/api/announcements')
      .then(res => ({ ...res, data: res.data.map(a => FirefishAPI.Converter.announcement(a)) }))
  }

  public async dismissInstanceAnnouncement(_id: string): Promise<Response<Record<never, never>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async addReactionToAnnouncement(_id: string, _name: string): Promise<Response<Record<never, never>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async removeReactionFromAnnouncement(_id: string, _name: string): Promise<Response<Record<never, never>>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  // ======================================
  // Emoji reactions
  // ======================================
  /**
   * POST /api/notes/reactions/create
   *
   * @param {string} id Target note ID.
   * @param {string} emoji Reaction emoji string. This string is raw unicode emoji or custom emoji name (not shortcode).
   */
  public async createEmojiReaction(id: string, emoji: string): Promise<Response<Entity.Status>> {
    await this.client.post<Record<never, never>>('/api/notes/reactions/create', {
      noteId: id,
      reaction: this.reactionName(emoji)
    })
    return this.client
      .post<FirefishAPI.Entity.Note>('/api/notes/show', {
        noteId: id
      })
      .then(res => ({ ...res, data: FirefishAPI.Converter.note(res.data) }))
  }

  /**
   * POST /api/notes/reactions/delete
   *
   * @param {string} id Target note ID.
   * @param {string} emoji Reaction emoji string. This string is raw unicode emoji or custom emoji name (not shortcode).
   */
  public async deleteEmojiReaction(id: string, emoji: string): Promise<Response<Entity.Status>> {
    await this.client.post<Record<never, never>>('/api/notes/reactions/delete', {
      noteId: id,
      reaction: this.reactionName(emoji)
    })
    return this.client
      .post<FirefishAPI.Entity.Note>('/api/notes/show', {
        noteId: id
      })
      .then(res => ({ ...res, data: FirefishAPI.Converter.note(res.data) }))
  }

  public async getEmojiReactions(id: string): Promise<Response<Array<Entity.Reaction>>> {
    return this.client
      .post<Array<FirefishAPI.Entity.Reaction>>('/api/notes/reactions', {
        noteId: id
      })
      .then(res => ({
        ...res,
        data: FirefishAPI.Converter.reactions(res.data)
      }))
  }

  public async getEmojiReaction(_id: string, _emoji: string): Promise<Response<Entity.Reaction>> {
    return new Promise((_, reject) => {
      const err = new NotImplementedError('Firefish does not support this method')
      reject(err)
    })
  }

  public async streamingURL(): Promise<string> {
    const instance = await this.getInstance()
    if (instance.data.urls) {
      return instance.data.urls.streaming_api
    }
    return this.baseUrl
  }

  public async userStreaming(): Promise<WebSocketInterface> {
    const url = await this.streamingURL()
    return this.client.socket(url, 'user')
  }

  public async publicStreaming(): Promise<WebSocketInterface> {
    const url = await this.streamingURL()
    return this.client.socket(url, 'globalTimeline')
  }

  public async localStreaming(): Promise<WebSocketInterface> {
    const url = await this.streamingURL()
    return this.client.socket(url, 'localTimeline')
  }

  public async tagStreaming(_tag: string): Promise<WebSocketInterface> {
    throw new NotImplementedError('TODO: implement')
  }

  public async listStreaming(list_id: string): Promise<WebSocketInterface> {
    const url = await this.streamingURL()
    return this.client.socket(url, 'list', list_id)
  }

  public async directStreaming(): Promise<WebSocketInterface> {
    const url = await this.streamingURL()
    return this.client.socket(url, 'conversation')
  }
}
