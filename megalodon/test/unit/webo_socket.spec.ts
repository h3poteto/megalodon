import { Parser } from '@/mastodon/web_socket'
import Entity from '@/entity'

const account: Entity.Account = {
  id: '1',
  username: 'h3poteto',
  acct: 'h3poteto@pleroma.io',
  display_name: 'h3poteto',
  locked: false,
  group: false,
  noindex: null,
  suspended: null,
  limited: null,
  created_at: '2019-03-26T21:30:32',
  followers_count: 10,
  following_count: 10,
  statuses_count: 100,
  note: 'engineer',
  url: 'https://pleroma.io',
  avatar: '',
  avatar_static: '',
  header: '',
  header_static: '',
  emojis: [],
  moved: null,
  fields: [],
  bot: false
}
const status: Entity.Status = {
  id: '1',
  uri: 'http://example.com',
  url: 'http://example.com',
  account: account,
  in_reply_to_id: null,
  in_reply_to_account_id: null,
  reblog: null,
  content: 'hoge',
  plain_content: 'hoge',
  created_at: '2019-03-26T21:40:32',
  emojis: [],
  replies_count: 0,
  reblogs_count: 0,
  favourites_count: 0,
  reblogged: null,
  favourited: null,
  muted: null,
  sensitive: false,
  spoiler_text: '',
  visibility: 'public',
  media_attachments: [],
  mentions: [],
  tags: [],
  card: null,
  poll: null,
  application: {
    name: 'Web'
  } as Entity.Application,
  language: null,
  pinned: null,
  emoji_reactions: [],
  bookmarked: false,
  quote: false
}

const notification: Entity.Notification = {
  id: '1',
  account: account,
  status: status,
  type: 'favourite',
  created_at: '2019-04-01T17:01:32'
}

const conversation: Entity.Conversation = {
  id: '1',
  accounts: [account],
  last_status: status,
  unread: true
}

describe('Parser', () => {
  let parser: Parser

  beforeEach(() => {
    parser = new Parser()
  })

  describe('parse', () => {
    describe('message is heartbeat', () => {
      describe('message is an object', () => {
        const message = Buffer.alloc(0)

        it('should be called', () => {
          const spy = jest.fn()
          parser.once('heartbeat', spy)
          parser.parse(message, true)
          expect(spy).toHaveBeenCalledWith({})
        })
      })
      describe('message is empty string', () => {
        const message: string = ''

        it('should be called', () => {
          const spy = jest.fn()
          parser.once('heartbeat', spy)
          parser.parse(Buffer.from(message), false)
          expect(spy).toHaveBeenCalledWith({})
        })
      })
    })

    describe('message is not json', () => {
      describe('event is delete', () => {
        const message = JSON.stringify({
          event: 'delete',
          payload: '12asdf34'
        })

        it('should be called', () => {
          const spy = jest.fn()
          parser.once('delete', spy)
          parser.parse(Buffer.from(message), false)
          expect(spy).toHaveBeenCalledWith('12asdf34')
        })
      })
      describe('event is not delete', () => {
        const message = JSON.stringify({
          event: 'event',
          payload: '12asdf34'
        })

        it('should be called', () => {
          const error = jest.fn()
          const deleted = jest.fn()
          parser.once('error', error)
          parser.once('delete', deleted)
          parser.parse(Buffer.from(message), false)
          expect(error).toHaveBeenCalled()
          expect(deleted).not.toHaveBeenCalled()
        })
      })
    })

    describe('message is json', () => {
      describe('event is update', () => {
        const message = JSON.stringify({
          event: 'update',
          payload: JSON.stringify(status)
        })
        it('should be called', () => {
          const spy = jest.fn()
          parser.once('update', spy)
          parser.parse(Buffer.from(message), false)
          expect(spy).toHaveBeenCalledWith(status)
        })
      })

      describe('event is notification', () => {
        const message = JSON.stringify({
          event: 'notification',
          payload: JSON.stringify(notification)
        })
        it('should be called', () => {
          const spy = jest.fn()
          parser.once('notification', spy)
          parser.parse(Buffer.from(message), false)
          expect(spy).toHaveBeenCalledWith(notification)
        })
      })

      describe('event is conversation', () => {
        const message = JSON.stringify({
          event: 'conversation',
          payload: JSON.stringify(conversation)
        })
        it('should be called', () => {
          const spy = jest.fn()
          parser.once('conversation', spy)
          parser.parse(Buffer.from(message), false)
          expect(spy).toHaveBeenCalledWith(conversation)
        })
      })
    })
  })
})
