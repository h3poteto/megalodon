import { HttpsProxyAgent } from 'https-proxy-agent'
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

const proxyAgent = (proxyConfig: ProxyConfig): HttpsProxyAgent<'http'> | HttpsProxyAgent<'https'> | SocksProxyAgent => {
  switch (proxyConfig.protocol) {
    case 'http': {
      let url = new URL(`http://${proxyConfig.host}:${proxyConfig.port}`)
      if (proxyConfig.auth) {
        url = new URL(`http://${proxyConfig.auth.username}:${proxyConfig.auth.password}@${proxyConfig.host}:${proxyConfig.port}`)
      }
      const httpsAgent = new HttpsProxyAgent<'http'>(url)
      return httpsAgent
    }
    case 'https': {
      let url = new URL(`https://${proxyConfig.host}:${proxyConfig.port}`)
      if (proxyConfig.auth) {
        url = new URL(`https://${proxyConfig.auth.username}:${proxyConfig.auth.password}@${proxyConfig.host}:${proxyConfig.port}`)
      }
      const httpsAgent = new HttpsProxyAgent<'https'>(url)
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
