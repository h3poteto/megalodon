import { OAuth2 } from 'oauth'
import MastodonAPI from './mastodon/api_client'
import { ProxyConfig } from './proxy_config'
import OAuth from './oauth'
import Response from './response'
import StreamListener from './stream_listener'
import WebSocket from './web_socket'
import MegalodonInterface, { NoImplementedError } from './megalodon'
import { Application } from './entities/application'
import { Account } from './entities/account'
import { Status } from './entities/status'
import { List } from './entities/list'
import { IdentityProof } from './entities/identity_proof'
import { Relationship } from './entities/relationship'
import { Filter } from './entities/filter'
import { Report } from './entities/report'
import { FeaturedTag } from './entities/featured_tag'
import { Tag } from './entities/tag'
import { Preferences } from './entities/preferences'
import { Context } from './entities/context'
import { Attachment } from './entities/attachment'
import { Poll } from './entities/poll'
import { ScheduledStatus } from './entities/scheduled_status'
import { Conversation } from './entities/conversation'
import { Marker } from './entities/marker'
import { Notification } from './entities/notification'
import { Results } from './entities/results'
import { Instance } from './entities/instance'
import { Activity } from './entities/activity'
import { Emoji } from './entities/emoji'
import { PushSubscription } from './entities/push_subscription'
import { Token } from './entities/token'

const NO_REDIRECT = 'urn:ietf:wg:oauth:2.0:oob'
const DEFAULT_SCOPE = 'read write follow'
const DEFAULT_UA = 'megalodon'

export default class Mastodon implements MegalodonInterface {
  public client: MastodonAPI.Client
  public baseUrl: string

  /**
   * @param baseUrl hostname or base URL
   * @param accessToken access token from OAuth2 authorization
   * @param userAgent UserAgent is specified in header on request.
   * @param proxyConfig Proxy setting, or set false if don't use proxy.
   */
  constructor(baseUrl: string, accessToken: string = '', userAgent: string = DEFAULT_UA, proxyConfig: ProxyConfig | false = false) {
    this.client = new MastodonAPI.Client(baseUrl, accessToken, userAgent, proxyConfig)
    this.baseUrl = baseUrl
  }

  public cancel(): void {
    return this.client.cancel()
  }

  public async registerApp(
    client_name: string,
    options: Partial<{ scopes: string; redirect_uris: string; website: string }> = {
      scopes: DEFAULT_SCOPE,
      redirect_uris: NO_REDIRECT
    }
  ): Promise<OAuth.AppData> {
    return this.createApp(client_name, options).then(async appData => {
      return this.generateAuthUrl(appData.client_id, appData.client_secret, {
        redirect_uri: appData.redirect_uri,
        scope: options.scopes
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
    options: Partial<{ redirect_uris: string; scopes: string; website: string }> = {
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
      client_name,
      redirect_uris,
      scopes
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
    options: Partial<{ redirect_uri: string; scope: string }> = {
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
        scope: options.scope
      })
      resolve(url)
    })
  }

  // ======================================
  // apps
  // ======================================
  public verifyAppCredentials(): Promise<Response<Application>> {
    return this.client.get<Application>('/api/v1/apps/verify_credentials')
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
  public registerAccount(
    username: string,
    email: string,
    password: string,
    agreement: boolean,
    locale: string,
    reason?: string | null
  ): Promise<Response<Token>> {
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
    return this.client.post<Token>('/api/v1/accounts', params)
  }

  public verifyAccountCredentials(): Promise<Response<Account>> {
    return this.client.get<Account>('/api/v1/accounts/verify_credentials')
  }

  public updateCredentials(
    discoverable?: string | null,
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
  ): Promise<Response<Account>> {
    let params = {}
    if (discoverable) {
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
    return this.client.patch<Account>('/api/v1/accounts/update_credentials', params)
  }

  public getAccount(id: string): Promise<Response<Account>> {
    return this.client.get<Account>(`/api/v1/accounts/${id}`)
  }

  public getAccountStatuses(id: string): Promise<Response<Array<Status>>> {
    return this.client.get<Array<Status>>(`/api/v1/accounts/${id}/statuses`)
  }

  public subscribeAccount(_id: string): Promise<Response<Relationship>> {
    return new Promise((_, reject) => {
      const err = new NoImplementedError('mastodon does not support')
      reject(err)
    })
  }

  public unsubscribeAccount(_id: string): Promise<Response<Relationship>> {
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
  ): Promise<Response<Array<Status>>> {
    return new Promise((_, reject) => {
      const err = new NoImplementedError('mastodon does not support')
      reject(err)
    })
  }

  public getAccountFollowers(
    id: string,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null
  ): Promise<Response<Array<Account>>> {
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
    return this.client.get<Array<Account>>(`/api/v1/accounts/${id}/followers`, params)
  }

  public getAccountFollowing(
    id: string,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null
  ): Promise<Response<Array<Account>>> {
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
    return this.client.get<Array<Account>>(`/api/v1/accounts/${id}/following`, params)
  }

  public getAccountLists(id: string): Promise<Response<Array<List>>> {
    return this.client.get<Array<List>>(`/api/v1/accounts/${id}/lists`)
  }

  public getIdentityProof(id: string): Promise<Response<Array<IdentityProof>>> {
    return this.client.get<Array<IdentityProof>>(`/api/v1/accounts/${id}/identity_proofs`)
  }

  public followAccount(id: string, reblog: boolean = true): Promise<Response<Relationship>> {
    return this.client.post<Relationship>(`/api/v1/accounts/${id}/follow`, {
      reblog: reblog
    })
  }

  public unfollowAccount(id: string): Promise<Response<Relationship>> {
    return this.client.post<Relationship>(`/api/v1/accounts/${id}/unfollow`)
  }

  public blockAccount(id: string): Promise<Response<Relationship>> {
    return this.client.post<Relationship>(`/api/v1/accounts/${id}/block`)
  }

  public unblockAccount(id: string): Promise<Response<Relationship>> {
    return this.client.post<Relationship>(`/api/v1/accounts/${id}/unblock`)
  }

  public muteAccount(id: string, notifications: boolean = true): Promise<Response<Relationship>> {
    return this.client.post<Relationship>(`/api/v1/accounts/${id}/mute`, {
      notifications: notifications
    })
  }

  public unmuteAccount(id: string): Promise<Response<Relationship>> {
    return this.client.post<Relationship>(`/api/v1/accounts/${id}/unmute`)
  }

  public pinAccount(id: string): Promise<Response<Relationship>> {
    return this.client.post<Relationship>(`/api/v1/accounts/${id}/pin`)
  }

  public unpinAccount(id: string): Promise<Response<Relationship>> {
    return this.client.post<Relationship>(`/api/v1/accounts/${id}/unpin`)
  }

  public getRelationship(ids: Array<string>): Promise<Response<Relationship>> {
    return this.client.get<Relationship>('/api/v1/accounts/relationships', {
      id: ids
    })
  }

  public searchAccount(
    q: string,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null
  ): Promise<Response<Array<Account>>> {
    let params = { q: q }
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
    return this.client.get<Array<Account>>('/api/v1/accounts/search', params)
  }

  // ======================================
  // accounts/bookmarks
  // ======================================

  public getBookmarks(
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Status>>> {
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
    return this.client.get<Array<Status>>('/api/v1/bookmarks', params)
  }

  // ======================================
  //  accounts/favourites
  // ======================================

  public getFavourites(limit?: number | null, max_id?: string | null, min_id?: string | null): Promise<Response<Array<Status>>> {
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
    return this.client.get<Array<Status>>('/api/v1/favourites', params)
  }

  // ======================================
  // accounts/mutes
  // ======================================

  public getMutes(limit?: number | null, max_id?: string | null, min_id?: string | null): Promise<Response<Array<Account>>> {
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
    return this.client.get<Array<Account>>('/api/v1/mutes', params)
  }

  // ======================================
  // accounts/blocks
  // ======================================

  public getBlocks(limit?: number | null, max_id?: string | null, min_id?: string | null): Promise<Response<Array<Account>>> {
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
    return this.client.get<Array<Account>>('/api/v1/blocks', params)
  }

  // ======================================
  // accounts/domain_blocks
  // ======================================
  public getDomainBlocks(limit?: number | null, max_id?: string | null, min_id?: string | null): Promise<Response<Array<string>>> {
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

  public getFilters(): Promise<Response<Array<Filter>>> {
    return this.client.get<Array<Filter>>('/api/v1/filters')
  }

  public getFilter(id: string): Promise<Response<Filter>> {
    return this.client.get<Filter>(`/api/v1/filters/${id}`)
  }

  public createFilter(
    phrase: string,
    context: Array<'home' | 'notifications' | 'public' | 'thread'>,
    irreversible?: boolean | null,
    whole_word?: boolean | null,
    expires_in?: string | null
  ): Promise<Response<Filter>> {
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
    return this.client.post<Filter>('/api/v1/filters', params)
  }

  public updateFilter(
    id: string,
    phrase: string,
    context: Array<'home' | 'notifications' | 'public' | 'thread'>,
    irreversible?: boolean | null,
    whole_word?: boolean | null,
    expires_in?: string | null
  ): Promise<Response<Filter>> {
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
    return this.client.post<Filter>(`/api/v1/filters/${id}`, params)
  }

  public deleteFilter(id: string): Promise<Response<Filter>> {
    return this.client.del<Filter>(`/api/v1/filters/${id}`)
  }

  // ======================================
  // accounts/reports
  // ======================================
  public report(
    account_id: string,
    status_ids?: Array<string> | null,
    comment?: string | null,
    forward?: boolean | null
  ): Promise<Response<Report>> {
    let params = {
      account_id: account_id
    }
    if (status_ids) {
      params = Object.assign(params, {
        status_ids: status_ids
      })
    }
    if (comment) {
      params = Object.assign(params, {
        comment: comment
      })
    }
    if (forward !== null) {
      params = Object.assign(params, {
        forward: forward
      })
    }
    return this.client.post<Report>('/api/v1/reports', params)
  }

  // ======================================
  // accounts/follow_requests
  // ======================================
  public getFollowRequests(limit?: number): Promise<Response<Array<Account>>> {
    if (limit) {
      return this.client.get<Array<Account>>('/api/v1/follow_requests', {
        limit: limit
      })
    } else {
      return this.client.get<Array<Account>>('/api/v1/follow_requests')
    }
  }

  public acceptFollowRequest(id: string): Promise<Response<Relationship>> {
    return this.client.post<Relationship>(`/api/v1/follow_requests/${id}/authorize`)
  }

  public rejectFollowRequest(id: string): Promise<Response<Relationship>> {
    return this.client.post<Relationship>(`/api/v1/follow_requests/${id}/reject`)
  }

  // ======================================
  // accounts/endorsements
  // ======================================
  public getEndorsements(limit?: number | null, max_id?: string | null, since_id?: string | null): Promise<Response<Array<Account>>> {
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
    return this.client.get<Array<Account>>('/api/v1/endorsements', params)
  }

  // ======================================
  // accounts/featured_tags
  // ======================================
  public getFeaturedTags(): Promise<Response<Array<FeaturedTag>>> {
    return this.client.get<Array<FeaturedTag>>('/api/v1/featured_tags')
  }

  public createFeaturedTag(name: string): Promise<Response<FeaturedTag>> {
    return this.client.post<FeaturedTag>('/api/v1/featured_tags', {
      name: name
    })
  }

  public deleteFeaturedTag(id: string): Promise<Response<{}>> {
    return this.client.del<{}>(`/api/v1/featured_tags/${id}`)
  }

  public getSuggestedTags(): Promise<Response<Array<Tag>>> {
    return this.client.get<Array<Tag>>('/api/v1/featured_tags/suggestions')
  }

  // ======================================
  // accounts/preferences
  // ======================================
  public getPreferences(): Promise<Response<Preferences>> {
    return this.client.get<Preferences>('/api/v1/preferences')
  }

  // ======================================
  // accounts/suggestions
  // ======================================
  public getSuggestions(limit?: number): Promise<Response<Array<Account>>> {
    if (limit) {
      return this.client.get<Array<Account>>('/api/v1/suggestions', {
        limit: limit
      })
    } else {
      return this.client.get<Array<Account>>('/api/v1/suggestions')
    }
  }

  // ======================================
  // statuses
  // ======================================
  public postStatus(
    status: string,
    media_ids: Array<string> = [],
    poll?: { options: Array<string>; expires_in: number; multiple?: boolean; hide_totals?: boolean } | null,
    in_reply_to_id?: string | null,
    sensitive?: boolean | null,
    spoiler_text?: string | null,
    visibility?: 'public' | 'unlisted' | 'private' | 'direct' | null,
    scheduled_at?: string | null,
    language?: string | null
  ): Promise<Response<Status>> {
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
    return this.client.post<Status>('/api/v1/statuses', params)
  }

  public getStatus(id: string): Promise<Response<Status>> {
    return this.client.get<Status>(`/api/v1/statuses/${id}`)
  }

  public deleteStatus(id: string): Promise<Response<Status>> {
    return this.client.del<Status>(`/api/v1/statuses/${id}`)
  }

  public getStatusContext(id: string): Promise<Response<Context>> {
    return this.client.get<Context>(`/api/v1/statuses/${id}/context`)
  }

  public getStatusRebloggedBy(id: string): Promise<Response<Array<Account>>> {
    return this.client.get<Array<Account>>(`/api/v1/statuses/${id}/reblogged_by`)
  }

  public getStatusFavouritedBy(id: string): Promise<Response<Array<Account>>> {
    return this.client.get<Array<Account>>(`/api/v1/statuses/${id}/favourited_by`)
  }

  public favouriteStatus(id: string): Promise<Response<Status>> {
    return this.client.post<Status>(`/api/v1/statuses/${id}/favourite`)
  }

  public unfavouriteStatus(id: string): Promise<Response<Status>> {
    return this.client.post<Status>(`/api/v1/statuses/${id}/unfavourite`)
  }

  public reblogStatus(id: string): Promise<Response<Status>> {
    return this.client.post<Status>(`/api/v1/statuses/${id}/reblog`)
  }

  public unreblogStatus(id: string): Promise<Response<Status>> {
    return this.client.post<Status>(`/api/v1/statuses/${id}/unreblog`)
  }

  public bookmarkStatus(id: string): Promise<Response<Status>> {
    return this.client.post<Status>(`/api/v1/statuses/${id}/bookmark`)
  }

  public unbookmarkStatus(id: string): Promise<Response<Status>> {
    return this.client.post<Status>(`/api/v1/statuses/${id}/unbookmark`)
  }

  public muteStatus(id: string): Promise<Response<Status>> {
    return this.client.post<Status>(`/api/v1/statuses/${id}/mute`)
  }

  public unmuteStatus(id: string): Promise<Response<Status>> {
    return this.client.post<Status>(`/api/v1/statuses/${id}/unmute`)
  }

  public pinStatus(id: string): Promise<Response<Status>> {
    return this.client.post<Status>(`/api/v1/statuses/${id}/pin`)
  }

  public unpinStatus(id: string): Promise<Response<Status>> {
    return this.client.post<Status>(`/api/v1/statuses/${id}/unpin`)
  }

  // ======================================
  // statuses/media
  // ======================================
  public uploadMedia(file: any, description?: string | null, focus?: string | null): Promise<Response<Attachment>> {
    let params = {
      file: file
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
    return this.client.post<Attachment>('/api/v1/media', params)
  }

  public updateMedia(id: string, file?: any, description?: string | null, focus?: string | null): Promise<Response<Attachment>> {
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
    return this.client.put<Attachment>(`/api/v1/media/${id}`, params)
  }

  // ======================================
  // statuses/polls
  // ======================================
  public getPoll(id: string): Promise<Response<Poll>> {
    return this.client.get<Poll>(`/api/v1/polls/${id}`)
  }

  public votePoll(id: string, choices: Array<number>): Promise<Response<Poll>> {
    return this.client.post<Poll>(`/api/v1/polls/${id}/votes`, {
      choices: choices
    })
  }

  // ======================================
  // statuses/scheduled_statuses
  // ======================================
  public getScheduledStatuses(
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<ScheduledStatus>>> {
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
    return this.client.get<Array<ScheduledStatus>>('/api/v1/scheduled_statuses', params)
  }

  public getScheduledStatus(id: string): Promise<Response<ScheduledStatus>> {
    return this.client.get<ScheduledStatus>(`/api/v1/scheduled_statuses/${id}`)
  }

  public scheduleStatus(id: string, scheduled_at?: string | null): Promise<Response<ScheduledStatus>> {
    let params = {}
    if (scheduled_at) {
      params = Object.assign(params, {
        scheduled_at: scheduled_at
      })
    }
    return this.client.put<ScheduledStatus>(`/api/v1/scheduled_statuses/${id}`, params)
  }

  public cancelScheduledStatus(id: string): Promise<Response<{}>> {
    return this.client.del<{}>(`/api/v1/scheduled_statuses/${id}`)
  }

  // ======================================
  // timelines
  // ======================================
  public getPublicTimeline(
    local?: boolean | null,
    only_media?: boolean | null,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Status>>> {
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
    return this.client.get<Array<Status>>('/api/v1/timelines/public', params)
  }

  public getTagTimeline(
    hashtag: string,
    local?: boolean | null,
    only_media?: boolean | null,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Status>>> {
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
    return this.client.get<Array<Status>>(`/api/v1/timelines/tag/${hashtag}`, params)
  }

  public getHomeTimeline(
    local?: boolean | null,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Status>>> {
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
    return this.client.get<Array<Status>>('/api/v1/timelines/home', params)
  }

  public getListTimeline(
    list_id: string,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Status>>> {
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
    return this.client.get<Array<Status>>(`/api/v1/timelines/list/${list_id}`, params)
  }

  // ======================================
  // timelines/conversations
  // ======================================
  public getConversationTimeline(
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null
  ): Promise<Response<Array<Status>>> {
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
    return this.client.get<Array<Status>>('/api/v1/conversations', params)
  }

  public deleteConversation(id: string): Promise<Response<{}>> {
    return this.client.del<{}>(`/api/v1/conversations/${id}`)
  }

  public readConversation(id: string): Promise<Response<Conversation>> {
    return this.client.post<Conversation>(`/api/v1/conversations/${id}/read`)
  }

  // ======================================
  // timelines/lists
  // ======================================
  public getLists(): Promise<Response<Array<List>>> {
    return this.client.get<Array<List>>('/api/v1/lists')
  }

  public getList(id: string): Promise<Response<List>> {
    return this.client.get<List>(`/api/v1/lists/${id}`)
  }

  public createList(title: string): Promise<Response<List>> {
    return this.client.post<List>('/api/v1/lists', {
      title: title
    })
  }

  public updateList(id: string, title: string): Promise<Response<List>> {
    return this.client.put<List>(`/api/v1/lists/${id}`, {
      title: title
    })
  }

  public deleteList(id: string): Promise<Response<{}>> {
    return this.client.del<{}>(`/api/v1/lists/${id}`)
  }

  public getAccountsInList(
    id: string,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null
  ): Promise<Response<Array<Account>>> {
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
    return this.client.get<Array<Account>>(`/api/v1/lists/${id}/accounts`, params)
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
  public getMarker(timeline: Array<'home' | 'notifications'>): Promise<Response<Marker | {}>> {
    return this.client.get<Marker | {}>('/api/v1/markers', {
      timeline: timeline
    })
  }

  public saveMarker(home?: { last_read_id: string } | null, notifications?: { last_read_id: string } | null): Promise<Response<Marker>> {
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
    return this.client.post<Marker>('/api/v1/markers', params)
  }

  // ======================================
  // notifications
  // ======================================
  public getNotifications(
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null,
    min_id?: string | null,
    exclude_type?: Array<'follow' | 'favourite' | 'reblog' | 'mention' | 'poll'> | null,
    account_id?: string | null
  ): Promise<Response<Array<Notification>>> {
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
    return this.client.get<Array<Notification>>('/api/v1/notifications', params)
  }

  public getNotification(id: string): Promise<Response<Notification>> {
    return this.client.get<Notification>(`/api/v1/notifications/${id}`)
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
  public subscribePushNotification(
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    data?: { alerts: { follow?: boolean; favourite?: boolean; reblog?: boolean; mention?: boolean; poll?: boolean } } | null
  ): Promise<Response<PushSubscription>> {
    let params = {
      subscription
    }
    if (data) {
      params = Object.assign(params, {
        data
      })
    }
    return this.client.post<PushSubscription>('/api/v1/push/subscription', params)
  }

  public getPushSubscription(): Promise<Response<PushSubscription>> {
    return this.client.get<PushSubscription>('/api/v1/push/subscription')
  }

  public updatePushSubscription(
    data?: { alerts: { follow?: boolean; favourite?: boolean; reblog?: boolean; mention?: boolean; poll?: boolean } } | null
  ): Promise<Response<PushSubscription>> {
    let params = {}
    if (data) {
      params = Object.assign(params, {
        data
      })
    }
    return this.client.put<PushSubscription>('/api/v1/push/subscription', params)
  }

  public deletePushSubscription(): Promise<Response<{}>> {
    return this.client.del<{}>('/api/v1/push/subscription')
  }

  // ======================================
  // search
  // ======================================
  public search(
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
  ): Promise<Response<Results>> {
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
    return this.client.get<Results>('/api/v2/search', params)
  }

  // ======================================
  // instance
  // ======================================
  public getInstance(): Promise<Response<Instance>> {
    return this.client.get<Instance>('/api/v1/instance')
  }

  public getInstancePeers(): Promise<Response<Array<string>>> {
    return this.client.get<Array<string>>('/api/v1/instance/peers')
  }

  public getInstanceActivity(): Promise<Response<Array<Activity>>> {
    return this.client.get<Array<Activity>>('/api/v1/instance/activity')
  }

  // ======================================
  // instance/trends
  // ======================================
  /**
   * GET /api/v1/trends
   *
   * @param limit Maximum number of results to return. Defaults to 10.
   */
  public getInstanceTrends(limit?: number | null): Promise<Response<Array<Tag>>> {
    let params = {}
    if (limit) {
      params = Object.assign(params, {
        limit
      })
    }
    return this.client.get<Array<Tag>>('/api/v1/trends', params)
  }

  // ======================================
  // instance/directory
  // ======================================
  public getInstanceDirectory(
    limit?: number | null,
    offset?: number | null,
    order?: 'active' | 'new' | null,
    local?: boolean | null
  ): Promise<Response<Array<Account>>> {
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
    return this.client.get<Array<Account>>('/api/v1/directory', params)
  }

  // ======================================
  // instance/custom_emojis
  // ======================================
  public getInstanceCustomEmojis(): Promise<Response<Array<Emoji>>> {
    return this.client.get<Array<Emoji>>('/api/v1/custom_emojis')
  }

  // ======================================
  // HTTP Streaming
  // ======================================
  public userStream(): StreamListener {
    return this.client.stream('/api/v1/streaming/user')
  }

  public publicStream(): StreamListener {
    return this.client.stream('/api/v1/streaming/public')
  }

  public localStream(): StreamListener {
    return this.client.stream('/api/v1/streaming/public/local')
  }

  public tagStream(tag: string): StreamListener {
    return this.client.stream(`/api/v1/streaming/hashtag?tag=${tag}`)
  }

  public listStream(list_id: string): StreamListener {
    return this.client.stream(`/api/v1/streaming/list?list=${list_id}`)
  }

  public directStream(): StreamListener {
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
