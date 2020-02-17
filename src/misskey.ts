import MisskeyAPI from './misskey/api_client'
import { NO_REDIRECT, DEFAULT_UA } from './default'
import { ProxyConfig } from './proxy_config'
import OAuth from './oauth'
import Response from './response'
import { NoImplementedError } from './megalodon'

export default class Misskey {
  public client: MisskeyAPI.Client
  public baseUrl: string
  public proxyConfig: ProxyConfig | false

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
    this.client = new MisskeyAPI.Client(baseUrl, token, agent, proxyConfig)
    this.baseUrl = baseUrl
    this.proxyConfig = proxyConfig
  }

  public cancel(): void {
    return this.client.cancel()
  }

  public async registerApp(
    client_name: string,
    options: Partial<{ scopes: Array<string>; redirect_uris: string; website: string }> = {
      scopes: MisskeyAPI.DEFAULT_SCOPE,
      redirect_uris: NO_REDIRECT
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
      scopes: MisskeyAPI.DEFAULT_SCOPE,
      redirect_uris: NO_REDIRECT
    }
  ): Promise<OAuth.AppData> {
    const redirect_uris = options.redirect_uris || NO_REDIRECT
    const scopes = options.scopes || MisskeyAPI.DEFAULT_SCOPE

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
    return MisskeyAPI.Client.post<MisskeyAPI.App>('/api/app/create', params, this.baseUrl, this.proxyConfig).then(
      (res: Response<MisskeyAPI.App>) => {
        const appData: OAuth.AppDataFromServer = {
          id: res.data.id,
          name: res.data.name,
          website: null,
          redirect_uri: res.data.callbackUrl,
          client_id: '',
          client_secret: res.data.secret
        }
        return OAuth.AppData.from(appData)
      }
    )
  }

  /**
   * POST /api/auth/session/generate
   */
  public async generateAuthUrlAndToken(clientSecret: string): Promise<MisskeyAPI.Session> {
    return MisskeyAPI.Client.post<MisskeyAPI.Session>('/api/auth/session/generate', {
      appSecret: clientSecret
    }).then((res: Response<MisskeyAPI.Session>) => res.data)
  }

  // ======================================
  // apps
  // ======================================
  public async verifyAppCredentials(): Promise<Response<Entity.Application>> {
    return new Promise((_, reject) => {
      const err = new NoImplementedError('misskey does not support')
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
    _client_id: string,
    client_secret: string,
    session_token: string,
    _redirect_uri: string
  ): Promise<OAuth.TokenData> {
    return MisskeyAPI.Client.post<MisskeyAPI.UserKey>('/api/auth/session/userkey', {
      appSecret: client_secret,
      token: session_token
    }).then(res => {
      const token = new OAuth.TokenData(res.data.accessToken, 'misskey', '', 0, null, null)
      return token
    })
  }

  public async refreshToken(_client_id: string, _client_secret: string, _refresh_token: string): Promise<OAuth.TokenData> {
    return new Promise((_, reject) => {
      const err = new NoImplementedError('misskey does not support')
      reject(err)
    })
  }

  public async revokeToken(_client_id: string, _client_secret: string, _token: string): Promise<Response<{}>> {
    return new Promise((_, reject) => {
      const err = new NoImplementedError('misskey does not support')
      reject(err)
    })
  }
}
