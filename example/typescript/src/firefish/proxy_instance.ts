import generator, { Entity, ProxyConfig, Response } from 'megalodon'

const BASE_URL: string = process.env.FIREFISH_URL!

const proxy: ProxyConfig = {
  host: process.env.PROXY_HOST!,
  port: parseInt(process.env.PROXY_PORT!),
  protocol: process.env.PROXY_PROTOCOL! as 'http' | 'https' | 'socks4' | 'socks4a' | 'socks5' | 'socks5h' | 'socks'
}

const client = generator('firefish', BASE_URL, '', null, proxy)

client
  .getInstance()
  .then((res: Response<Entity.Instance>) => {
    console.log(res)
  })
  .catch(err => console.error(err))
