import MastodonAPI from './mastodon/api_client'
import StreamListener from './stream_listener'
import WebSocket from './web_socket'
import Response from './response'
import OAuth from './oauth'
import { isCancel, RequestCanceledError } from './cancel'
import { ProxyConfig } from './proxy_config'
//
import generator, { MegalodonInterface } from './megalodon'
import Mastodon from './mastodon'
import Pleroma from './pleroma'
import Misskey from './misskey'
import Entity from './entity'

export {
  MastodonAPI,
  StreamListener,
  WebSocket,
  Response,
  OAuth,
  RequestCanceledError,
  isCancel,
  ProxyConfig,
  //
  MegalodonInterface,
  Mastodon,
  Pleroma,
  Misskey,
  Entity
}

export default generator
