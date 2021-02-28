import Entity from './entity'

namespace NotificationType {
  export const Follow: Entity.NotificationType = 'follow'
  export const Favourite: Entity.NotificationType = 'favourite'
  export const Reblog: Entity.NotificationType = 'reblog'
  export const Mention: Entity.NotificationType = 'mention'
  export const Poll: Entity.NotificationType = 'poll'
  export const EmojiReaction: Entity.NotificationType = 'emoji_reaction'
  export const FollowRequest: Entity.NotificationType = 'follow_request'
  export const Status: Entity.NotificationType = 'status'
}

export default NotificationType
