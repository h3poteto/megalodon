import MastodonAPI from '@/mastodon/api_client'
import MegalodonEntity from '@/entity'
import MastodonEntity from '@/mastodon/entity'
import MegalodonNotificationType from '@/notification'
import MastodonNotificationType from '@/mastodon/notification'

describe('api_client', () => {
  describe('notification', () => {
    describe('encode', () => {
      it('megalodon notification type should be encoded to mastodon notification type', () => {
        const cases: Array<{ src: MegalodonEntity.NotificationType; dist: MastodonEntity.NotificationType }> = [
          {
            src: MegalodonNotificationType.Follow,
            dist: MastodonNotificationType.Follow
          },
          {
            src: MegalodonNotificationType.Favourite,
            dist: MastodonNotificationType.Favourite
          },
          {
            src: MegalodonNotificationType.Reblog,
            dist: MastodonNotificationType.Reblog
          },
          {
            src: MegalodonNotificationType.Mention,
            dist: MastodonNotificationType.Mention
          },
          {
            src: MegalodonNotificationType.PollExpired,
            dist: MastodonNotificationType.Poll
          },
          {
            src: MegalodonNotificationType.FollowRequest,
            dist: MastodonNotificationType.FollowRequest
          },
          {
            src: MegalodonNotificationType.Status,
            dist: MastodonNotificationType.Status
          }
        ]
        cases.forEach(c => {
          expect(MastodonAPI.Converter.encodeNotificationType(c.src)).toEqual(c.dist)
        })
      })
    })
    describe('decode', () => {
      it('mastodon notification type should be decoded to megalodon notification type', () => {
        const cases: Array<{ src: MastodonEntity.NotificationType; dist: MegalodonEntity.NotificationType }> = [
          {
            src: MastodonNotificationType.Follow,
            dist: MegalodonNotificationType.Follow
          },
          {
            src: MastodonNotificationType.Favourite,
            dist: MegalodonNotificationType.Favourite
          },
          {
            src: MastodonNotificationType.Mention,
            dist: MegalodonNotificationType.Mention
          },
          {
            src: MastodonNotificationType.Reblog,
            dist: MegalodonNotificationType.Reblog
          },
          {
            src: MastodonNotificationType.Poll,
            dist: MegalodonNotificationType.PollExpired
          },
          {
            src: MastodonNotificationType.FollowRequest,
            dist: MegalodonNotificationType.FollowRequest
          }
        ]
        cases.forEach(c => {
          expect(MastodonAPI.Converter.decodeNotificationType(c.src)).toEqual(c.dist)
        })
      })
    })
  })
})
