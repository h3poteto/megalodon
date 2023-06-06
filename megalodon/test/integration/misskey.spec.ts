import MisskeyEntity from '@/misskey/entity'
import MisskeyNotificationType from '@/misskey/notification'
import Misskey from '@/misskey'
import MegalodonNotificationType from '@/notification'
import axios, { AxiosHeaders, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

jest.mock('axios')

const user: MisskeyEntity.User = {
  id: '1',
  name: 'test_user',
  username: 'TestUser',
  host: 'misskey.io',
  avatarUrl: 'https://example.com/icon.png',
  avatarColor: '#000000',
  emojis: []
}

const note: MisskeyEntity.Note = {
  id: '1',
  createdAt: '2021-02-01T01:49:29',
  userId: '1',
  user: user,
  text: 'hogehoge',
  cw: null,
  visibility: 'public',
  renoteCount: 0,
  repliesCount: 0,
  reactions: {},
  reactionEmojis: {},
  emojis: [],
  fileIds: [],
  files: [],
  replyId: null,
  renoteId: null
}

const follow: MisskeyEntity.Notification = {
  id: '1',
  createdAt: '2021-02-01T01:49:29',
  userId: user.id,
  user: user,
  type: MisskeyNotificationType.Follow
}

const mention: MisskeyEntity.Notification = {
  id: '1',
  createdAt: '2021-02-01T01:49:29',
  userId: user.id,
  user: user,
  type: MisskeyNotificationType.Mention,
  note: note
}

const reply: MisskeyEntity.Notification = {
  id: '1',
  createdAt: '2021-02-01T01:49:29',
  userId: user.id,
  user: user,
  type: MisskeyNotificationType.Reply,
  note: note
}

const renote: MisskeyEntity.Notification = {
  id: '1',
  createdAt: '2021-02-01T01:49:29',
  userId: user.id,
  user: user,
  type: MisskeyNotificationType.Renote,
  note: note
}

const quote: MisskeyEntity.Notification = {
  id: '1',
  createdAt: '2021-02-01T01:49:29',
  userId: user.id,
  user: user,
  type: MisskeyNotificationType.Quote,
  note: note
}

const reaction: MisskeyEntity.Notification = {
  id: '1',
  createdAt: '2021-02-01T01:49:29',
  userId: user.id,
  user: user,
  type: MisskeyNotificationType.Reaction,
  note: note,
  reaction: '♥'
}

const pollVote: MisskeyEntity.Notification = {
  id: '1',
  createdAt: '2021-02-01T01:49:29',
  userId: user.id,
  user: user,
  type: MisskeyNotificationType.PollVote,
  note: note
}

const receiveFollowRequest: MisskeyEntity.Notification = {
  id: '1',
  createdAt: '2021-02-01T01:49:29',
  userId: user.id,
  user: user,
  type: MisskeyNotificationType.ReceiveFollowRequest
}

const followRequestAccepted: MisskeyEntity.Notification = {
  id: '1',
  createdAt: '2021-02-01T01:49:29',
  userId: user.id,
  user: user,
  type: MisskeyNotificationType.FollowRequestAccepted
}

const groupInvited: MisskeyEntity.Notification = {
  id: '1',
  createdAt: '2021-02-01T01:49:29',
  userId: user.id,
  user: user,
  type: MisskeyNotificationType.GroupInvited
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
  const client = new Misskey('http://localhost', 'sample token')
  const cases: Array<{ event: MisskeyEntity.Notification; expected: Entity.NotificationType; title: string }> = [
    {
      event: follow,
      expected: MegalodonNotificationType.Follow,
      title: 'follow'
    },
    {
      event: mention,
      expected: MegalodonNotificationType.Mention,
      title: 'mention'
    },
    {
      event: reply,
      expected: MegalodonNotificationType.Mention,
      title: 'reply'
    },
    {
      event: renote,
      expected: MegalodonNotificationType.Reblog,
      title: 'renote'
    },
    {
      event: quote,
      expected: MegalodonNotificationType.Reblog,
      title: 'quote'
    },
    {
      event: reaction,
      expected: MegalodonNotificationType.EmojiReaction,
      title: 'reaction'
    },
    {
      event: pollVote,
      expected: MegalodonNotificationType.PollVote,
      title: 'pollVote'
    },
    {
      event: receiveFollowRequest,
      expected: MegalodonNotificationType.FollowRequest,
      title: 'receiveFollowRequest'
    },
    {
      event: followRequestAccepted,
      expected: MegalodonNotificationType.Follow,
      title: 'followRequestAccepted'
    }
  ]
  cases.forEach(c => {
    it(`should be ${c.title} event`, async () => {
      const config: InternalAxiosRequestConfig<any> = {
        headers: new AxiosHeaders()
      }
      const mockResponse: AxiosResponse<Array<MisskeyEntity.Notification>> = {
        data: [c.event],
        status: 200,
        statusText: '200OK',
        headers: {},
        config: config
      }
      ;(axios.post as any).mockResolvedValue(mockResponse)
      const res = await client.getNotifications()
      expect(res.data[0].type).toEqual(c.expected)
    })
  })
  it('groupInvited event should be ignored', async () => {
    const config: InternalAxiosRequestConfig<any> = {
      headers: new AxiosHeaders()
    }
    const mockResponse: AxiosResponse<Array<MisskeyEntity.Notification>> = {
      data: [groupInvited],
      status: 200,
      statusText: '200OK',
      headers: {},
      config: config
    }
    ;(axios.post as any).mockResolvedValue(mockResponse)
    const res = await client.getNotifications()
    expect(res.data).toEqual([])
  })
})
