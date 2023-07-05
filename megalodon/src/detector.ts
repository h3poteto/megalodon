import axios, { AxiosRequestConfig } from 'axios'
import proxyAgent, { ProxyConfig } from './proxy_config'
import { NodeinfoError } from './megalodon'

const NODEINFO_10 = 'http://nodeinfo.diaspora.software/ns/schema/1.0'
const NODEINFO_20 = 'http://nodeinfo.diaspora.software/ns/schema/2.0'
const NODEINFO_21 = 'http://nodeinfo.diaspora.software/ns/schema/2.1'

type Links = {
  links: Array<Link>
}

type Link = {
  href: string
  rel: string
}

type Nodeinfo10 = {
  software: Software
  metadata: Metadata
}

type Nodeinfo20 = {
  software: Software
  metadata: Metadata
}

type Nodeinfo21 = {
  software: Software
  metadata: Metadata
}

type Software = {
  name: string
}

type Metadata = {
  upstream?: {
    name: string
  }
}

/**
 * Detect SNS type.
 * Now support Mastodon, Pleroma and Pixelfed. Throws an error when no known platform can be detected.
 *
 * @param url Base URL of SNS.
 * @param proxyConfig Proxy setting, or set false if don't use proxy.
 * @return SNS name.
 */
export const detector = async (
  url: string,
  proxyConfig: ProxyConfig | false = false
): Promise<'mastodon' | 'pleroma' | 'misskey' | 'friendica'> => {
  let options: AxiosRequestConfig = {
    timeout: 20000
  }
  if (proxyConfig) {
    options = Object.assign(options, {
      httpsAgent: proxyAgent(proxyConfig)
    })
  }

  const res = await axios.get<Links>(url + '/.well-known/nodeinfo', options)
  const link = res.data.links.find(l => l.rel === NODEINFO_20 || l.rel === NODEINFO_21)
  if (!link) throw new NodeinfoError('Could not find nodeinfo')
  switch (link.rel) {
    case NODEINFO_10: {
      const res = await axios.get<Nodeinfo10>(link.href, options)
      switch (res.data.software.name) {
        case 'pleroma':
          return 'pleroma'
        case 'akkoma':
          return 'pleroma'
        case 'mastodon':
          return 'mastodon'
        case "wildebeest":
          return "mastodon"
        case 'misskey':
          return 'misskey'
        case 'friendica':
          return 'friendica'
        default:
          if (res.data.metadata.upstream?.name && res.data.metadata.upstream.name === 'mastodon') {
            return 'mastodon'
          }
          throw new NodeinfoError('Unknown SNS')
      }
    }
    case NODEINFO_20: {
      const res = await axios.get<Nodeinfo20>(link.href, options)
      switch (res.data.software.name) {
        case 'pleroma':
          return 'pleroma'
        case 'akkoma':
          return 'pleroma'
        case 'mastodon':
          return 'mastodon'
        case "wildebeest":
          return "mastodon"
        case 'misskey':
          return 'misskey'
        case 'friendica':
          return 'friendica'
        default:
          if (res.data.metadata.upstream?.name && res.data.metadata.upstream.name === 'mastodon') {
            return 'mastodon'
          }
          throw new NodeinfoError('Unknown SNS')
      }
    }
    case NODEINFO_21: {
      const res = await axios.get<Nodeinfo21>(link.href, options)
      switch (res.data.software.name) {
        case 'pleroma':
          return 'pleroma'
        case 'akkoma':
          return 'pleroma'
        case 'mastodon':
          return 'mastodon'
        case "wildebeest":
          return "mastodon"
        case 'misskey':
          return 'misskey'
        case 'friendica':
          return 'friendica'
        default:
          if (res.data.metadata.upstream?.name && res.data.metadata.upstream.name === 'mastodon') {
            return 'mastodon'
          }
          throw new NodeinfoError('Unknown SNS')
      }
    }
    default:
      throw new NodeinfoError('Could not find nodeinfo')
  }
}
