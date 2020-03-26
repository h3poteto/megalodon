import createHttpsProxyAgent, { HttpsProxyAgent } from 'https-proxy-agent'
import createSocksProxyAgent, { SocksProxyAgent } from 'socks-proxy-agent'

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
  let auth = ''
  if (proxyConfig.auth) {
    auth = `${proxyConfig.auth.username}:${proxyConfig.auth.password}@`
  }
  switch (proxyConfig.protocol) {
    case 'http':
    case 'https': {
      const httpsAgent = createHttpsProxyAgent(`${proxyConfig.protocol}://${auth}${proxyConfig.host}:${proxyConfig.port}`)
      return httpsAgent
    }
    case 'socks4':
    case 'socks4a':
    case 'socks5':
    case 'socks5h':
    case 'socks': {
      const socksAgent = createSocksProxyAgent(`${proxyConfig.protocol}://${auth}${proxyConfig.host}:${proxyConfig.port}`)
      return socksAgent
    }
    default:
      throw new ProxyProtocolError('protocol is not accepted')
  }
}
export default proxyAgent
