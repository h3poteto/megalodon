import { OAuth2 } from 'oauth'
import axios, { AxiosResponse, CancelTokenSource, AxiosRequestConfig } from 'axios'

import StreamListener from './stream_listener'
import WebSocket from './web_socket'
import OAuth from './oauth'
import Response from './response'
import { RequestCanceledError } from './cancel'
import proxyAgent, { ProxyConfig } from './proxy_config'

const NO_REDIRECT = 'urn:ietf:wg:oauth:2.0:oob'
const DEFAULT_URL = 'https://mastodon.social'
const DEFAULT_SCOPE = 'read write follow'
const DEFAULT_UA = 'megalodon'

/**
 * Interface
 */
export interface MegalodonInstance {
  get<T = any>(path: string, params: object): Promise<Response<T>>
  put<T = any>(path: string, params: object): Promise<Response<T>>
  patch<T = any>(path: string, params: object): Promise<Response<T>>
  post<T = any>(path: string, params: object): Promise<Response<T>>
  del(path: string, params: object): Promise<Response<{}>>
  cancel(): void
  stream(path: string, reconnectInterval: number): StreamListener
  socket(path: string, strea: string): WebSocket
}

/**
 * Mastodon API client.
 *
 * Using axios for request, you will handle promises.
 */
export default class Mastodon implements MegalodonInstance {
  static DEFAULT_SCOPE = DEFAULT_SCOPE
  static DEFAULT_URL = DEFAULT_URL
  static NO_REDIRECT = NO_REDIRECT

  private accessToken: string
  private baseUrl: string
  private userAgent: string
  private cancelTokenSource: CancelTokenSource
  private proxyConfig: ProxyConfig | false = false

  /**
   * @param accessToken access token from OAuth2 authorization
   * @param baseUrl hostname or base URL
   * @param userAgent UserAgent is specified in header on request.
   * @param proxyConfig Proxy setting, or set false if don't use proxy.
   */
  constructor(
    accessToken: string,
    baseUrl: string = DEFAULT_URL,
    userAgent: string = DEFAULT_UA,
    proxyConfig: ProxyConfig | false = false
  ) {
    this.accessToken = accessToken
    this.baseUrl = baseUrl
    this.userAgent = userAgent
    this.cancelTokenSource = axios.CancelToken.source()
    this.proxyConfig = proxyConfig
  }

  /**
   * First, call createApp to get client_id and client_secret.
   * Next, call generateAuthUrl to get authorization url.
   * @param client_name Form Data, which is sent to /api/v1/apps
   * @param options Form Data, which is sent to /api/v1/apps. and properties should be **snake_case**
   * @param baseUrl base URL of the target
   * @param proxyConfig Proxy setting, or set false if don't use proxy.
   */
  public static async registerApp(
    client_name: string,
    options: Partial<{ scopes: string; redirect_uris: string; website: string }> = {
      scopes: DEFAULT_SCOPE,
      redirect_uris: NO_REDIRECT
    },
    baseUrl = DEFAULT_URL,
    proxyConfig: ProxyConfig | false = false
  ): Promise<OAuth.AppData> {
    return this.createApp(client_name, options, baseUrl, proxyConfig).then(async appData => {
      return this.generateAuthUrl(
        appData.client_id,
        appData.client_secret,
        {
          redirect_uri: appData.redirect_uri,
          scope: options.scopes
        },
        baseUrl
      ).then(url => {
        appData.url = url
        return appData
      })
    })
  }

  /**
   * Create an application
   *
   * First, POST /api/v1/apps.
   * @param client_name your application's name
   * @param options Form Data
   * @param baseUrl target of base URL
   * @param proxyConfig Proxy setting, or set false if don't use proxy.
   */
  public static async createApp(
    client_name: string,
    options: Partial<{ redirect_uris: string; scopes: string; website: string }> = {
      redirect_uris: NO_REDIRECT,
      scopes: DEFAULT_SCOPE
    },
    baseUrl = DEFAULT_URL,
    proxyConfig: ProxyConfig | false = false
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

    return this._post<OAuth.AppDataFromServer>('/api/v1/apps', params, baseUrl, proxyConfig).then(
      (res: Response<OAuth.AppDataFromServer>) => OAuth.AppData.from(res.data)
    )
  }

  /**
   * Generate authorization url using OAuth2.
   *
   * @param clientId your OAuth app's client ID
   * @param clientSecret your OAuth app's client Secret
   * @param options as property, redirect_uri and scope are available, and must be the same as when you register your app
   * @param baseUrl base URL of the target
   */
  public static generateAuthUrl(
    clientId: string,
    clientSecret: string,
    options: Partial<{ redirect_uri: string; scope: string }> = {
      redirect_uri: NO_REDIRECT,
      scope: DEFAULT_SCOPE
    },
    baseUrl = DEFAULT_URL
  ): Promise<string> {
    return new Promise(resolve => {
      const oauth = new OAuth2(clientId, clientSecret, baseUrl, undefined, '/oauth/token')
      const url = oauth.getAuthorizeUrl({
        redirect_uri: options.redirect_uri,
        response_type: 'code',
        client_id: clientId,
        scope: options.scope
      })
      resolve(url)
    })
  }

  /**
   * Fetch OAuth access token.
   * Get an access token based client_id and client_secret and authorization code.
   *
   * @param client_id will be generated by #createApp or #registerApp
   * @param client_secret will be generated by #createApp or #registerApp
   * @param code will be generated by the link of #generateAuthUrl or #registerApp
   * @param baseUrl base URL of the target
   * @param redirect_uri must be the same uri as the time when you register your OAuth application
   * @param proxyConfig Proxy setting, or set false if don't use proxy.
   */
  public static async fetchAccessToken(
    client_id: string,
    client_secret: string,
    code: string,
    baseUrl = DEFAULT_URL,
    redirect_uri = NO_REDIRECT,
    proxyConfig: ProxyConfig | false = false
  ): Promise<OAuth.TokenData> {
    return this._post<OAuth.TokenDataFromServer>(
      '/oauth/token',
      {
        client_id,
        client_secret,
        code,
        redirect_uri,
        grant_type: 'authorization_code'
      },
      baseUrl,
      proxyConfig
    ).then((res: Response<OAuth.TokenDataFromServer>) => OAuth.TokenData.from(res.data))
  }

  /**
   * Refresh OAuth access token.
   * Send refresh token and get new access token.
   *
   * @param client_id will be generated by #createApp or #registerApp
   * @param client_secret will be generated by #createApp or #registerApp
   * @param refresh_token will be get #fetchAccessToken
   * @param baseUrl base URL or the target
   * @param proxyConfig Proxy setting, or set false if don't use proxy.
   */
  public static async refreshToken(
    client_id: string,
    client_secret: string,
    refresh_token: string,
    baseUrl = DEFAULT_URL,
    proxyConfig: ProxyConfig | false = false
  ): Promise<OAuth.TokenData> {
    return this._post<OAuth.TokenDataFromServer>(
      '/oauth/token',
      {
        client_id,
        client_secret,
        refresh_token,
        grant_type: 'refresh_token'
      },
      baseUrl,
      proxyConfig
    ).then((res: Response<OAuth.TokenDataFromServer>) => OAuth.TokenData.from(res.data))
  }

  /**
   * Unauthorized GET request to mastodon REST API.
   * @param path relative path from baseUrl
   * @param params Query parameters
   * @param baseUrl base URL of the target
   * @param proxyConfig Proxy setting, or set false if don't use proxy.
   */
  public static async get<T>(
    path: string,
    params = {},
    baseUrl = DEFAULT_URL,
    proxyConfig: ProxyConfig | false = false
  ): Promise<Response<T>> {
    const apiUrl = baseUrl
    let options: AxiosRequestConfig = {
      params: params
    }
    if (proxyConfig) {
      options = Object.assign(options, {
        httpsAgent: proxyAgent(proxyConfig)
      })
    }
    return axios.get<T>(apiUrl + path, options).then((resp: AxiosResponse<T>) => {
      const res: Response<T> = {
        data: resp.data,
        status: resp.status,
        statusText: resp.statusText,
        headers: resp.headers
      }
      return res
    })
  }

  private static async _post<T>(
    path: string,
    params = {},
    baseUrl = DEFAULT_URL,
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
   * GET request to mastodon REST API.
   * @param path relative path from baseUrl
   * @param params Query parameters
   */
  public async get<T>(path: string, params = {}): Promise<Response<T>> {
    let options: AxiosRequestConfig = {
      cancelToken: this.cancelTokenSource.token,
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      },
      params: params
    }
    if (this.proxyConfig) {
      options = Object.assign(options, {
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
   */
  public async put<T>(path: string, params = {}): Promise<Response<T>> {
    let options: AxiosRequestConfig = {
      cancelToken: this.cancelTokenSource.token,
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    }
    if (this.proxyConfig) {
      options = Object.assign(options, {
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
   * PATCH request to mastodon REST API.
   * @param path relative path from baseUrl
   * @param params Form data. If you want to post file, please use FormData()
   */
  public async patch<T>(path: string, params = {}): Promise<Response<T>> {
    let options: AxiosRequestConfig = {
      cancelToken: this.cancelTokenSource.token,
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    }
    if (this.proxyConfig) {
      options = Object.assign(options, {
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
   * POST request to mastodon REST API.
   * @param path relative path from baseUrl
   * @param params Form data
   */
  public async post<T>(path: string, params = {}): Promise<Response<T>> {
    let options: AxiosRequestConfig = {
      cancelToken: this.cancelTokenSource.token,
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    }
    if (this.proxyConfig) {
      options = Object.assign(options, {
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
   * DELETE request to mastodon REST API.
   * @param path relative path from baseUrl
   * @param params Form data
   */
  public async del<T>(path: string, params = {}): Promise<Response<T>> {
    let options: AxiosRequestConfig = {
      cancelToken: this.cancelTokenSource.token,
      data: params,
      headers: {
        Authorization: `Bearer ${this.accessToken}`
      }
    }
    if (this.proxyConfig) {
      options = Object.assign(options, {
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
    return this.cancelTokenSource.cancel('Request is canceled by user')
  }

  /**
   * Receive Server-sent Events from Mastodon Streaming API.
   * Create streaming connection, and start streamin.
   *
   * @param path relative path from baseUrl
   * @param reconnectInterval interval of reconnect
   * @returns streamListener, which inherits from EventEmitter
   */
  public stream(path: string, reconnectInterval = 1000): StreamListener {
    const headers = {
      'Cache-Control': 'no-cache',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${this.accessToken}`,
      'User-Agent': this.userAgent
    }
    const url = this.baseUrl + path
    const streaming = new StreamListener(url, headers, this.proxyConfig, reconnectInterval)
    process.nextTick(() => {
      streaming.start()
    })
    return streaming
  }

  /**
   * Get connection and receive websocket connection for Pleroma API.
   *
   * @param path relative path from baseUrl: normally it is `/streaming`.
   * @param stream Stream name, please refer: https://git.pleroma.social/pleroma/pleroma/blob/develop/lib/pleroma/web/mastodon_api/mastodon_socket.ex#L19-28
   * @returns WebSocket, which inherits from EventEmitter
   */
  public socket(path: string, stream: string): WebSocket {
    const url = this.baseUrl + path
    const streaming = new WebSocket(url, stream, this.accessToken, this.userAgent, this.proxyConfig)
    process.nextTick(() => {
      streaming.start()
    })
    return streaming
  }
}
