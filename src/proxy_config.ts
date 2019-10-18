import HttpsProxyAgent from 'https-proxy-agent'

export type ProxyConfig = {
  host: string
  port: number
  auth?: {
    username: string
    password: string
  }
  protocol: string
}

const proxyAgent = (proxyConfig: ProxyConfig): HttpsProxyAgent => {
  let auth = ''
  if (proxyConfig.auth) {
    auth = `${proxyConfig.auth.username}:${proxyConfig.auth.password}@`
  }
  const agent = new HttpsProxyAgent(`${proxyConfig.protocol}://${auth}${proxyConfig.host}:${proxyConfig.port}`)
  return agent
}
export default proxyAgent
