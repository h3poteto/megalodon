import axios, { AxiosResponse, CancelTokenSource, AxiosRequestConfig } from 'axios'
import StreamListener from '../stream_listener'
import WebSocket from '../web_socket'
import Response from '../response'
import { RequestCanceledError } from '../cancel'
import proxyAgent, { ProxyConfig } from '../proxy_config'
import { NO_REDIRECT, DEFAULT_SCOPE, DEFAULT_UA } from '../default'

namespace MastodonAPI {
  /**
   * Interface
   */
  export interface Interface {
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
  export class Client implements Interface {
    static DEFAULT_SCOPE = DEFAULT_SCOPE
    static DEFAULT_URL = 'https://mastodon.social'
    static NO_REDIRECT = NO_REDIRECT

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
     * Unauthorized GET request to mastodon REST API.
     * @param path relative path from baseUrl
     * @param params Query parameters
     * @param baseUrl base URL of the target
     * @param proxyConfig Proxy setting, or set false if don't use proxy.
     */
    public static async get<T>(
      path: string,
      params = {},
      baseUrl = this.DEFAULT_URL,
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
        'Content-Type': 'text/event-stream',
        Authorization: `Bearer ${this.accessToken}`,
        'User-Agent': this.userAgent
      }
      const url = this.baseUrl + path + `?access_token=${this.accessToken}`
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
    public socket(path: string, stream: string, params: string | null = null): WebSocket {
      const url = this.baseUrl + path
      const streaming = new WebSocket(url, stream, params, this.accessToken, this.userAgent, this.proxyConfig)
      process.nextTick(() => {
        streaming.start()
      })
      return streaming
    }
  }
}
export default MastodonAPI
