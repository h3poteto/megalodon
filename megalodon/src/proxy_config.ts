import { HttpsProxyAgent, HttpsProxyAgentOptions } from 'https-proxy-agent'
import { SocksProxyAgent } from 'socks-proxy-agent'

export type ProxyConfig = {
  host: string
  port: number
  auth?: {
    username: string
    password: string
  }
  protocol: 'http' | 'https' | 'socks4' | 'socks4a' | 'socks5' | 'socks5h' | 'socks'
}

class ProxyProtocolError extends Error {}

const proxyAgent = (proxyConfig: ProxyConfig): HttpsProxyAgent | SocksProxyAgent => {
  switch (proxyConfig.protocol) {
    case 'http': {
      let options: HttpsProxyAgentOptions = {
        host: proxyConfig.host,
        port: proxyConfig.port,
        secureProxy: false
      }
      if (proxyConfig.auth) {
        options = Object.assign(options, {
          auth: `${proxyConfig.auth.username}:${proxyConfig.auth.password}`
        })
      }
      const httpsAgent = new HttpsProxyAgent(options)
      return httpsAgent
    }
    case 'https': {
      let options: HttpsProxyAgentOptions = {
        host: proxyConfig.host,
        port: proxyConfig.port,
        secureProxy: true
      }
      if (proxyConfig.auth) {
        options = Object.assign(options, {
          auth: `${proxyConfig.auth.username}:${proxyConfig.auth.password}`
        })
      }
      const httpsAgent = new HttpsProxyAgent(options)
      return httpsAgent
    }
    case 'socks4':
    case 'socks4a':
    case 'socks5':
    case 'socks5h':
    case 'socks': {
      let url = `socks://${proxyConfig.host}:${proxyConfig.port}`
      if (proxyConfig.auth) {
        url = `socks://${proxyConfig.auth.username}:${proxyConfig.auth.password}@${proxyConfig.host}:${proxyConfig.port}`
      }
      const socksAgent = new SocksProxyAgent(url)
      return socksAgent
    }
    default:
      throw new ProxyProtocolError('protocol is not accepted')
  }
}
export default proxyAgent
