import { WebSocketInterface } from '../megalodon'
import { EventEmitter } from 'events'
import { ProxyConfig } from '../proxy_config'

export default class WebSocket extends EventEmitter implements WebSocketInterface {
  constructor(
    _url: string,
    _stream: string,
    _params: string | undefined,
    _accessToken: string,
    _userAgent: string,
    _proxyConfig: ProxyConfig | false = false
  ) {
    super()
  }
  public start() {}
  public stop() {}
}
