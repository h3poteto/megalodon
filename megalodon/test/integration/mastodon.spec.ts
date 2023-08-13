import MastodonEntity from '@/mastodon/entity'
import MastodonNotificationType from '@/mastodon/notification'
import Mastodon from '@/mastodon'
import MegalodonNotificationType from '@/notification'
import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios'

jest.mock('axios')

const account: MastodonEntity.Account = {
  id: '1',
  username: 'h3poteto',
  acct: 'h3poteto@pleroma.io',
  display_name: 'h3poteto',
  locked: false,
  group: false,
  noindex: false,
  suspended: false,
  limited: false,
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

const status: MastodonEntity.Status = {
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
  bookmarked: false
}

const follow: MastodonEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '1',
  type: MastodonNotificationType.Follow
}

const favourite: MastodonEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '2',
  status: status,
  type: MastodonNotificationType.Favourite
}

const mention: MastodonEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '3',
  status: status,
  type: MastodonNotificationType.Mention
}

const reblog: MastodonEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '4',
  status: status,
  type: MastodonNotificationType.Reblog
}

const poll: MastodonEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '5',
  type: MastodonNotificationType.Poll
}

const followRequest: MastodonEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '6',
  type: MastodonNotificationType.FollowRequest
}

const toot: MastodonEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '7',
  status: status,
  type: MastodonNotificationType.Status
}

const unknownEvent: MastodonEntity.Notification = {
  account: account,
  created_at: '2021-01-31T23:33:26',
  id: '8',
  type: 'unknown'
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
  const client = new Mastodon('http://localhost', 'sample token')
  const cases: Array<{ event: MastodonEntity.Notification; expected: Entity.NotificationType; title: string }> = [
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
      event: followRequest,
      expected: MegalodonNotificationType.FollowRequest,
      title: 'followRequest'
    },
    {
      event: toot,
      expected: MegalodonNotificationType.Status,
      title: 'status'
    }
  ]
  cases.forEach(c => {
    it(`should be ${c.title} event`, async () => {
      const config: InternalAxiosRequestConfig<any> = {
        headers: new AxiosHeaders()
      }
      const mockResponse: AxiosResponse<Array<MastodonEntity.Notification>> = {
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
    const mockResponse: AxiosResponse<Array<MastodonEntity.Notification>> = {
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
