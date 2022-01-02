import MisskeyAPI from '@/misskey/api_client'
import MegalodonEntity from '@/entity'
import MisskeyEntity from '@/misskey/entity'
import MegalodonNotificationType from '@/notification'
import MisskeyNotificationType from '@/misskey/notification'

const user: MisskeyEntity.User = {
  id: '1',
  name: 'test_user',
  username: 'TestUser',
  host: 'misskey.io',
  avatarUrl: 'https://example.com/icon.png',
  avatarColor: '#000000',
  emojis: []
}

describe('api_client', () => {
  describe('notification', () => {
    describe('encode', () => {
      it('megalodon notification type should be encoded to misskey notification type', () => {
        const cases: Array<{ src: MegalodonEntity.NotificationType; dist: MisskeyEntity.NotificationType }> = [
          {
            src: MegalodonNotificationType.Follow,
            dist: MisskeyNotificationType.Follow
          },
          {
            src: MegalodonNotificationType.Mention,
            dist: MisskeyNotificationType.Reply
          },
          {
            src: MegalodonNotificationType.Favourite,
            dist: MisskeyNotificationType.Reaction
          },
          {
            src: MegalodonNotificationType.EmojiReaction,
            dist: MisskeyNotificationType.Reaction
          },
          {
            src: MegalodonNotificationType.Reblog,
            dist: MisskeyNotificationType.Renote
          },
          {
            src: MegalodonNotificationType.PollVote,
            dist: MisskeyNotificationType.PollVote
          },
          {
            src: MegalodonNotificationType.FollowRequest,
            dist: MisskeyNotificationType.ReceiveFollowRequest
          }
        ]
        cases.forEach(c => {
          expect(MisskeyAPI.Converter.encodeNotificationType(c.src)).toEqual(c.dist)
        })
      })
    })
    describe('decode', () => {
      it('misskey notification type should be decoded to megalodon notification type', () => {
        const cases: Array<{ src: MisskeyEntity.NotificationType; dist: MegalodonEntity.NotificationType }> = [
          {
            src: MisskeyNotificationType.Follow,
            dist: MegalodonNotificationType.Follow
          },
          {
            src: MisskeyNotificationType.Mention,
            dist: MegalodonNotificationType.Mention
          },
          {
            src: MisskeyNotificationType.Reply,
            dist: MegalodonNotificationType.Mention
          },
          {
            src: MisskeyNotificationType.Renote,
            dist: MegalodonNotificationType.Reblog
          },
          {
            src: MisskeyNotificationType.Quote,
            dist: MegalodonNotificationType.Reblog
          },
          {
            src: MisskeyNotificationType.Reaction,
            dist: MegalodonNotificationType.EmojiReaction
          },
          {
            src: MisskeyNotificationType.PollVote,
            dist: MegalodonNotificationType.PollVote
          },
          {
            src: MisskeyNotificationType.ReceiveFollowRequest,
            dist: MegalodonNotificationType.FollowRequest
          },
          {
            src: MisskeyNotificationType.FollowRequestAccepted,
            dist: MegalodonNotificationType.Follow
          }
        ]
        cases.forEach(c => {
          expect(MisskeyAPI.Converter.decodeNotificationType(c.src)).toEqual(c.dist)
        })
      })
    })
  })
  describe('reactions', () => {
    it('should be mapped', () => {
      const misskeyReactions = [
        {
          id: '1',
          createdAt: '2020-04-21T13:04:13.968Z',
          user: {
            id: '81u70uwsja',
            name: 'h3poteto',
            username: 'h3poteto',
            host: null,
            avatarUrl: 'https://s3.arkjp.net/misskey/thumbnail-63807d97-20ca-40ba-9493-179aa48065c1.png',
            avatarColor: 'rgb(146,189,195)',
            emojis: []
          },
          type: '❤'
        },
        {
          id: '2',
          createdAt: '2020-04-21T13:04:13.968Z',
          user: {
            id: '81u70uwsja',
            name: 'h3poteto',
            username: 'h3poteto',
            host: null,
            avatarUrl: 'https://s3.arkjp.net/misskey/thumbnail-63807d97-20ca-40ba-9493-179aa48065c1.png',
            avatarColor: 'rgb(146,189,195)',
            emojis: []
          },
          type: '❤'
        },
        {
          id: '3',
          createdAt: '2020-04-21T13:04:13.968Z',
          user: {
            id: '81u70uwsja',
            name: 'h3poteto',
            username: 'h3poteto',
            host: null,
            avatarUrl: 'https://s3.arkjp.net/misskey/thumbnail-63807d97-20ca-40ba-9493-179aa48065c1.png',
            avatarColor: 'rgb(146,189,195)',
            emojis: []
          },
          type: '☺'
        },
        {
          id: '4',
          createdAt: '2020-04-21T13:04:13.968Z',
          user: {
            id: '81u70uwsja',
            name: 'h3poteto',
            username: 'h3poteto',
            host: null,
            avatarUrl: 'https://s3.arkjp.net/misskey/thumbnail-63807d97-20ca-40ba-9493-179aa48065c1.png',
            avatarColor: 'rgb(146,189,195)',
            emojis: []
          },
          type: '❤'
        }
      ]

      const reactions = MisskeyAPI.Converter.reactions(misskeyReactions)
      expect(reactions).toEqual([
        {
          count: 3,
          me: false,
          name: '❤'
        },
        {
          count: 1,
          me: false,
          name: '☺'
        }
      ])
    })
  })

  describe('status', () => {
    describe('plain content', () => {
      it('should be exported plain content and html content', () => {
        const plainContent = 'hoge\nfuga\nfuga'
        const content = 'hoge<br>fuga<br>fuga'
        const note: MisskeyEntity.Note = {
          id: '1',
          createdAt: '2021-02-01T01:49:29',
          userId: '1',
          user: user,
          text: plainContent,
          cw: null,
          visibility: 'public',
          renoteCount: 0,
          repliesCount: 0,
          reactions: {},
          emojis: [],
          fileIds: [],
          files: [],
          replyId: null,
          renoteId: null
        }
        const megalodonStatus = MisskeyAPI.Converter.note(note)
        expect(megalodonStatus.plain_content).toEqual(plainContent)
        expect(megalodonStatus.content).toEqual(content)
      })
      it('html tags should be escaped', () => {
        const plainContent = '<p>hoge\nfuga\nfuga<p>'
        const content = '&lt;p&gt;hoge<br>fuga<br>fuga&lt;p&gt;'
        const note: MisskeyEntity.Note = {
          id: '1',
          createdAt: '2021-02-01T01:49:29',
          userId: '1',
          user: user,
          text: plainContent,
          cw: null,
          visibility: 'public',
          renoteCount: 0,
          repliesCount: 0,
          reactions: {},
          emojis: [],
          fileIds: [],
          files: [],
          replyId: null,
          renoteId: null
        }
        const megalodonStatus = MisskeyAPI.Converter.note(note)
        expect(megalodonStatus.plain_content).toEqual(plainContent)
        expect(megalodonStatus.content).toEqual(content)
      })
    })
  })
})
