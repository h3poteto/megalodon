import axios, { AxiosResponse, CancelTokenSource, AxiosRequestConfig } from 'axios'
import { DEFAULT_UA } from '@/default'
import proxyAgent, { ProxyConfig } from '@/proxy_config'
import Response from '@/response'

namespace MisskeyAPI {
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

  export type App = {
    id: string
    name: string
    callbackUrl: string
    permission: Array<string>
    secret: string
  }

  export type Session = {
    token: string
    url: string
  }

  export type UserKey = {
    accessToken: string
  }
}

export default MisskeyAPI
