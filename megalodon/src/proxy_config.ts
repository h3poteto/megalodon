import { HttpsProxyAgent, HttpsProxyAgentOptions } from 'https-proxy-agent'
import { SocksProxyAgent, SocksProxyAgentOptions } from 'socks-proxy-agent'

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
    case 'socks4a': {
      let options: SocksProxyAgentOptions = {
        type: 4,
        hostname: proxyConfig.host,
        port: proxyConfig.port
      }
      if (proxyConfig.auth) {
        options = Object.assign(options, {
          userId: proxyConfig.auth.username,
          password: proxyConfig.auth.password
        })
      }
      const socksAgent = new SocksProxyAgent(options)
      return socksAgent
    }
    case 'socks5':
    case 'socks5h':
    case 'socks': {
      let options: SocksProxyAgentOptions = {
        type: 5,
        hostname: proxyConfig.host,
        port: proxyConfig.port
      }
      if (proxyConfig.auth) {
        options = Object.assign(options, {
          userId: proxyConfig.auth.username,
          password: proxyConfig.auth.password
        })
      }
      const socksAgent = new SocksProxyAgent(options)
      return socksAgent
    }
    default:
      throw new ProxyProtocolError('protocol is not accepted')
  }
}
export default proxyAgent
