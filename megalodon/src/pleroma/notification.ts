import PleromaEntity from './entity'

namespace PleromaNotificationType {
  export const Mention: PleromaEntity.NotificationType = 'mention'
  export const Reblog: PleromaEntity.NotificationType = 'reblog'
  export const Favourite: PleromaEntity.NotificationType = 'favourite'
  export const Follow: PleromaEntity.NotificationType = 'follow'
  export const Poll: PleromaEntity.NotificationType = 'poll'
  export const PleromaEmojiReaction: PleromaEntity.NotificationType = 'pleroma:emoji_reaction'
  export const FollowRequest: PleromaEntity.NotificationType = 'follow_request'
  export const Update: PleromaEntity.NotificationType = 'update'
  export const Move: PleromaEntity.NotificationType = 'move'
}

export default PleromaNotificationType
