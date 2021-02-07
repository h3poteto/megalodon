import PleromaAPI from '@/pleroma/api_client'
import MegalodonEntity from '@/entity'
import PleromaEntity from '@/pleroma/entity'
import MegalodonNotificationType from '@/notification'
import PleromaNotificationType from '@/pleroma/notification'

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
            src: MegalodonNotificationType.Poll,
            dist: PleromaNotificationType.Poll
          },
          {
            src: MegalodonNotificationType.EmojiReaction,
            dist: PleromaNotificationType.PleromaEmojiReaction
          },
          {
            src: MegalodonNotificationType.FollowRequest,
            dist: PleromaNotificationType.FollowRequest
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
            dist: MegalodonNotificationType.Poll
          },
          {
            src: PleromaNotificationType.PleromaEmojiReaction,
            dist: MegalodonNotificationType.EmojiReaction
          },
          {
            src: PleromaNotificationType.FollowRequest,
            dist: MegalodonNotificationType.FollowRequest
          }
        ]
        cases.forEach(c => {
          expect(PleromaAPI.Converter.decodeNotificationType(c.src)).toEqual(c.dist)
        })
      })
    })
  })
})
