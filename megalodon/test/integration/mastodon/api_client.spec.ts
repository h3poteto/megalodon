import MastodonAPI from '@/mastodon/api_client'
import Entity from '@/entity'
import Response from '@/response'
import axios, { AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from 'axios'

jest.mock('axios')

const account: Entity.Account = {
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

const status: Entity.Status = {
  id: '1',
  uri: 'http://example.com',
  url: 'http://example.com',
  account: account,
  in_reply_to_id: null,
  in_reply_to_account_id: null,
  reblog: null,
  content: 'hoge',
  plain_content: null,
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

const config: InternalAxiosRequestConfig<any> = {
  headers: new AxiosHeaders()
}

describe('get', () => {
  const client = new MastodonAPI.Client('testToken', 'https://pleroma.io/api/v1')
  const mockResponse: AxiosResponse<Array<Entity.Status>> = {
    data: [status],
    status: 200,
    statusText: '200OK',
    headers: {},
    config: config
  }
  it('should be responsed', async () => {
    ;(axios.get as any).mockResolvedValue(mockResponse)
    const response: Response<Array<Entity.Status>> = await client.get<Array<Entity.Status>>('/timelines/home')
    expect(response.data).toEqual([status])
  })
})

describe('put', () => {
  const client = new MastodonAPI.Client('testToken', 'https://pleroma.io/api/v1')
  const mockResponse: AxiosResponse<Entity.Account> = {
    data: account,
    status: 200,
    statusText: '200OK',
    headers: {},
    config: config
  }
  it('should be responsed', async () => {
    ;(axios.put as any).mockResolvedValue(mockResponse)
    const response: Response<Entity.Account> = await client.put<Entity.Account>('/accounts/update_credentials', {
      display_name: 'hoge'
    })
    expect(response.data).toEqual(account)
  })
})

describe('patch', () => {
  const client = new MastodonAPI.Client('testToken', 'https://pleroma.io/api/v1')
  const mockResponse: AxiosResponse<Entity.Account> = {
    data: account,
    status: 200,
    statusText: '200OK',
    headers: {},
    config: config
  }
  it('should be responsed', async () => {
    ;(axios.patch as any).mockResolvedValue(mockResponse)
    const response: Response<Entity.Account> = await client.patch<Entity.Account>('/accounts/update_credentials', {
      display_name: 'hoge'
    })
    expect(response.data).toEqual(account)
  })
})

describe('post', () => {
  const client = new MastodonAPI.Client('testToken', 'https://pleroma.io/api/v1')
  const mockResponse: AxiosResponse<Entity.Status> = {
    data: status,
    status: 200,
    statusText: '200OK',
    headers: {},
    config: config
  }
  it('should be responsed', async () => {
    ;(axios.post as any).mockResolvedValue(mockResponse)
    const response: Response<Entity.Status> = await client.post<Entity.Status>('/statuses', {
      status: 'hoge'
    })
    expect(response.data).toEqual(status)
  })
})

describe('del', () => {
  const client = new MastodonAPI.Client('testToken', 'https://pleroma.io/api/v1')
  const mockResponse: AxiosResponse<{}> = {
    data: {},
    status: 200,
    statusText: '200OK',
    headers: {},
    config: config
  }
  it('should be responsed', async () => {
    ;(axios.delete as any).mockResolvedValue(mockResponse)
    const response: Response<{}> = await client.del<{}>('/statuses/12asdf34')
    expect(response.data).toEqual({})
  })
})
