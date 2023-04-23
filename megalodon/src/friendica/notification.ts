import FriendicaEntity from './entity'

namespace FriendicaNotificationType {
  export const Mention: FriendicaEntity.NotificationType = 'mention'
  export const Reblog: FriendicaEntity.NotificationType = 'reblog'
  export const Favourite: FriendicaEntity.NotificationType = 'favourite'
  export const Follow: FriendicaEntity.NotificationType = 'follow'
  export const Poll: FriendicaEntity.NotificationType = 'poll'
  export const FollowRequest: FriendicaEntity.NotificationType = 'follow_request'
  export const Status: FriendicaEntity.NotificationType = 'status'
  export const Update: FriendicaEntity.NotificationType = 'update'
}

export default FriendicaNotificationType
