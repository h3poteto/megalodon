import PixelfedEntity from './entity.js'

namespace PixelfedNotificationType {
  export const Mention: PixelfedEntity.NotificationType = 'mention'
  export const Reblog: PixelfedEntity.NotificationType = 'reblog'
  export const Favourite: PixelfedEntity.NotificationType = 'favourite'
  export const Follow: PixelfedEntity.NotificationType = 'follow'
  export const FollowRequest: PixelfedEntity.NotificationType = 'follow_request'
}

export default PixelfedNotificationType
