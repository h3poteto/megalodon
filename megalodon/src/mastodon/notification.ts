import MastodonEntity from './entity'

namespace MastodonNotificationType {
  export const Mention: MastodonEntity.NotificationType = 'mention'
  export const Reblog: MastodonEntity.NotificationType = 'reblog'
  export const Favourite: MastodonEntity.NotificationType = 'favourite'
  export const Follow: MastodonEntity.NotificationType = 'follow'
  export const Poll: MastodonEntity.NotificationType = 'poll'
  export const FollowRequest: MastodonEntity.NotificationType = 'follow_request'
  export const Status: MastodonEntity.NotificationType = 'status'
  export const Update: MastodonEntity.NotificationType = 'update'
  export const EmojiReaction: MastodonEntity.NotificationType = 'emoji_reaction' // Fedibird Only Support
}

export default MastodonNotificationType
