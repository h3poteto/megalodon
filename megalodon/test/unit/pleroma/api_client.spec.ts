import PleromaAPI from '@/pleroma/api_client'
import MegalodonEntity from '@/entity'
import PleromaEntity from '@/pleroma/entity'
import MegalodonNotificationType from '@/notification'
import PleromaNotificationType from '@/pleroma/notification'

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

describe('api_client', () => {
  describe('notification', () => {
    describe('encode', () => {
      it('megalodon notification type should be encoded to pleroma notification type', () => {
        const cases: Array<{ src: MegalodonEntity.NotificationType; dist: PleromaEntity.NotificationType }> = [
          {
            src: MegalodonNotificationType.Follow,
            dist: PleromaNotificationType.Follow
          },
          {
            src: MegalodonNotificationType.Favourite,
            dist: PleromaNotificationType.Favourite
          },
          {
            src: MegalodonNotificationType.Reblog,
            dist: PleromaNotificationType.Reblog
          },
          {
            src: MegalodonNotificationType.Mention,
            dist: PleromaNotificationType.Mention
          },
          {
            src: MegalodonNotificationType.PollExpired,
            dist: PleromaNotificationType.Poll
          },
          {
            src: MegalodonNotificationType.EmojiReaction,
            dist: PleromaNotificationType.PleromaEmojiReaction
          },
          {
            src: MegalodonNotificationType.FollowRequest,
            dist: PleromaNotificationType.FollowRequest
          },
          {
            src: MegalodonNotificationType.Update,
            dist: PleromaNotificationType.Update
          },
          {
            src: MegalodonNotificationType.Move,
            dist: PleromaNotificationType.Move
          }
        ]
        cases.forEach(c => {
          expect(PleromaAPI.Converter.encodeNotificationType(c.src)).toEqual(c.dist)
        })
      })
    })
    describe('decode', () => {
      it('pleroma notification type should be decoded to megalodon notification type', () => {
        const cases: Array<{ src: PleromaEntity.NotificationType; dist: MegalodonEntity.NotificationType }> = [
          {
            src: PleromaNotificationType.Follow,
            dist: MegalodonNotificationType.Follow
          },
          {
            src: PleromaNotificationType.Favourite,
            dist: MegalodonNotificationType.Favourite
          },
          {
            src: PleromaNotificationType.Mention,
            dist: MegalodonNotificationType.Mention
          },
          {
            src: PleromaNotificationType.Reblog,
            dist: MegalodonNotificationType.Reblog
          },
          {
            src: PleromaNotificationType.Poll,
            dist: MegalodonNotificationType.PollExpired
          },
          {
            src: PleromaNotificationType.PleromaEmojiReaction,
            dist: MegalodonNotificationType.EmojiReaction
          },
          {
            src: PleromaNotificationType.FollowRequest,
            dist: MegalodonNotificationType.FollowRequest
          },
          {
            src: PleromaNotificationType.Update,
            dist: MegalodonNotificationType.Update
          },
          {
            src: PleromaNotificationType.Move,
            dist: MegalodonNotificationType.Move
          }
        ]
        cases.forEach(c => {
          expect(PleromaAPI.Converter.decodeNotificationType(c.src)).toEqual(c.dist)
        })
      })
    })
  })

  describe('status', () => {
    describe('plain content is included', () => {
      it('plain content in pleroma entity should be exported in plain_content column', () => {
        const plainContent = 'hoge\nfuga\nfuga'
        const content = '<p>hoge<br>fuga<br>fuga</p>'
        const pleromaStatus: PleromaEntity.Status = {
          id: '1',
          uri: 'https://pleroma.io/notice/1',
          url: 'https://pleroma.io/notice/1',
          account: account,
          in_reply_to_id: null,
          in_reply_to_account_id: null,
          reblog: null,
          content: content,
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
            content: {
              'text/plain': plainContent
            },
            local: false
          }
        }
        const megalodonStatus = PleromaAPI.Converter.status(pleromaStatus)
        expect(megalodonStatus.plain_content).toEqual(plainContent)
        expect(megalodonStatus.content).toEqual(content)
      })
    })

    describe('plain content is not included', () => {
      it('plain_content should be null', () => {
        const content = '<p>hoge<br>fuga<br>fuga</p>'
        const pleromaStatus: PleromaEntity.Status = {
          id: '1',
          uri: 'https://pleroma.io/notice/1',
          url: 'https://pleroma.io/notice/1',
          account: account,
          in_reply_to_id: null,
          in_reply_to_account_id: null,
          reblog: null,
          content: content,
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
        const megalodonStatus = PleromaAPI.Converter.status(pleromaStatus)
        expect(megalodonStatus.plain_content).toBeNull()
        expect(megalodonStatus.content).toEqual(content)
      })
    })
  })
})
