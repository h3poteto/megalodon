import GotosocialEntity from './entity'

namespace GotosocialNotificationType {
  export const Follow: GotosocialEntity.NotificationType = 'follow'
  export const FollowRequest: GotosocialEntity.NotificationType = 'follow_request'
  export const Mention: GotosocialEntity.NotificationType = 'mention'
  export const Reblog: GotosocialEntity.NotificationType = 'reblog'
  export const Favourite: GotosocialEntity.NotificationType = 'favourite'
  export const Poll: GotosocialEntity.NotificationType = 'poll'
  export const Status: GotosocialEntity.NotificationType = 'status'
}

export default GotosocialNotificationType
