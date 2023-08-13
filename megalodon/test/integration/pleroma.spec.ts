import PleromaEntity from '@/pleroma/entity'
import Pleroma from '@/pleroma'
import MegalodonNotificationType from '@/notification'
import PleromaNotificationType from '@/pleroma/notification'
import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios'

jest.mock('axios')

const account: PleromaEntity.Account = {
  id: '1',
  username: 'h3poteto',
  acct: 'h3poteto@pleroma.io',
  display_name: 'h3poteto',
  locked: false,
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
  bot: false,
  source: {
    privacy: null,
    sensitive: false,
    language: null,
    note: 'test',
    fields: []
  }
}

const status: PleromaEntity.Status = {
  id: '1',
  uri: 'http://example.com',
  url: 'http://example.com',
  account: account,
  in_reply_to_id: null,
  in_reply_to_account_id: null,
  reblog: null,
  content: 'hoge',
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
  } as MastodonEntity.Application,
  language: null,
  pinned: null,
  bookmarked: false,
  pleroma: {
    local: false
  }
}

const follow: PleromaEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '1',
  type: PleromaNotificationType.Follow
}

const favourite: PleromaEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '2',
  type: PleromaNotificationType.Favourite,
  status: status
}

const mention: PleromaEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '3',
  type: PleromaNotificationType.Mention,
  status: status
}

const reblog: PleromaEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '4',
  type: PleromaNotificationType.Reblog,
  status: status
}

const poll: PleromaEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '5',
  type: PleromaNotificationType.Poll,
  status: status
}

const emojiReaction: PleromaEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '6',
  type: PleromaNotificationType.PleromaEmojiReaction,
  status: status,
  emoji: '♥'
}

const unknownEvent: PleromaEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '8',
  type: 'unknown'
}

const followRequest: PleromaEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '7',
  type: PleromaNotificationType.FollowRequest
}

;(axios.CancelToken.source as any).mockImplementation(() => {
  return {
    token: {
      throwIfRequested: () => {},
      promise: {
        then: () => {},
        catch: () => {}
      }
    }
  }
})

describe('getNotifications', () => {
  const client = new Pleroma('http://localhost', 'sample token')
  const cases: Array<{ event: PleromaEntity.Notification; expected: Entity.NotificationType; title: string }> = [
    {
      event: follow,
      expected: MegalodonNotificationType.Follow,
      title: 'follow'
    },
    {
      event: favourite,
      expected: MegalodonNotificationType.Favourite,
      title: 'favourite'
    },
    {
      event: mention,
      expected: MegalodonNotificationType.Mention,
      title: 'mention'
    },
    {
      event: reblog,
      expected: MegalodonNotificationType.Reblog,
      title: 'reblog'
    },
    {
      event: poll,
      expected: MegalodonNotificationType.PollExpired,
      title: 'poll'
    },
    {
      event: emojiReaction,
      expected: MegalodonNotificationType.EmojiReaction,
      title: 'emojiReaction'
    },
    {
      event: followRequest,
      expected: MegalodonNotificationType.FollowRequest,
      title: 'followRequest'
    }
  ]
  cases.forEach(c => {
    it(`should be ${c.title} event`, async () => {
      const config: InternalAxiosRequestConfig<any> = {
        headers: new AxiosHeaders()
      }
      const mockResponse: AxiosResponse<Array<PleromaEntity.Notification>> = {
        data: [c.event],
        status: 200,
        statusText: '200OK',
        headers: {},
        config: config
      }
      ;(axios.get as any).mockResolvedValue(mockResponse)
      const res = await client.getNotifications()
      expect(res.data[0].type).toEqual(c.expected)
    })
  })
  it('UnknownEvent should be ignored', async () => {
    const config: InternalAxiosRequestConfig<any> = {
      headers: new AxiosHeaders()
    }
    const mockResponse: AxiosResponse<Array<PleromaEntity.Notification>> = {
      data: [unknownEvent],
      status: 200,
      statusText: '200OK',
      headers: {},
      config: config
    }
    ;(axios.get as any).mockResolvedValue(mockResponse)
    const res = await client.getNotifications()
    expect(res.data).toEqual([])
  })
})
