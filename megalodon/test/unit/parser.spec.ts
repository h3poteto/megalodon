import { Parser } from '@/parser'
import Entity from '@/entity'

const account: Entity.Account = {
  id: '1',
  username: 'h3poteto',
  acct: 'h3poteto@pleroma.io',
  display_name: 'h3poteto',
  locked: false,
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
  quote: null
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
      const message: string = ':thump\n'
      it('should be called', () => {
        const spy = jest.fn()
        parser.on('heartbeat', spy)
        parser.parse(message)
        expect(spy).toHaveBeenLastCalledWith({})
      })
    })

    describe('message is not json', () => {
      describe('event is delete', () => {
        const message = `event: delete\ndata: 12asdf34\n\n`
        it('should be called', () => {
          const spy = jest.fn()
          parser.once('delete', spy)
          parser.parse(message)
          expect(spy).toHaveBeenCalledWith('12asdf34')
        })
      })

      describe('event is not delete', () => {
        const message = `event: event\ndata: 12asdf34\n\n`
        it('should be error', () => {
          const error = jest.fn()
          const deleted = jest.fn()
          parser.once('error', error)
          parser.once('delete', deleted)
          parser.parse(message)
          expect(error).toHaveBeenCalled()
          expect(deleted).not.toHaveBeenCalled()
        })
      })
    })

    describe('message is json', () => {
      describe('event is update', () => {
        const message = `event: update\ndata: ${JSON.stringify(status)}\n\n`
        it('should be called', () => {
          const spy = jest.fn()
          parser.once('update', spy)
          parser.parse(message)
          expect(spy).toHaveBeenCalledWith(status)
        })
      })

      describe('event is notification', () => {
        const message = `event: notification\ndata: ${JSON.stringify(notification)}\n\n`
        it('should be called', () => {
          const spy = jest.fn()
          parser.once('notification', spy)
          parser.parse(message)
          expect(spy).toHaveBeenCalledWith(notification)
        })
      })

      describe('event is conversation', () => {
        const message = `event: conversation\ndata: ${JSON.stringify(conversation)}\n\n`
        it('should be called', () => {
          const spy = jest.fn()
          parser.once('conversation', spy)
          parser.parse(message)
          expect(spy).toHaveBeenCalledWith(conversation)
        })
      })
    })
  })
})
