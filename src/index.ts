import Mastodon from './mastodon'
import Account from './entities/account'
import Application from './entities/application'
import Mention from './entities/mention'
import Notification from './entities/notification'
import Status from './entities/status'
import Tag from './entities/tag'
import StreamListener from './stream_listener'
import WebSocket from './web_socket'
import Response from './response'
import OAuth from './oauth'

export { Account, Application, Mention, Notification, Status, Tag, StreamListener, WebSocket, Response, OAuth }

export default Mastodon
