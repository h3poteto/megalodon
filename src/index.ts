import MastodonAPI from './mastodon/api_client'
import Response from './response'
import OAuth from './oauth'
import { isCancel, RequestCanceledError } from './cancel'
import { ProxyConfig } from './proxy_config'
//
import generator, { MegalodonInterface, WebSocketInterface, StreamListenerInterface } from './megalodon'
import Mastodon from './mastodon'
import Pleroma from './pleroma'
import Misskey from './misskey'
import Entity from './entity'

export {
  MastodonAPI,
  Response,
  OAuth,
  RequestCanceledError,
  isCancel,
  ProxyConfig,
  //
  MegalodonInterface,
  WebSocketInterface,
  StreamListenerInterface,
  Mastodon,
  Pleroma,
  Misskey,
  Entity
}

export default generator
