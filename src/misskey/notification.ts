import MisskeyEntity from './entity'

namespace MisskeyNotificationType {
  export const Follow: MisskeyEntity.NotificationType = 'follow'
  export const Mention: MisskeyEntity.NotificationType = 'mention'
  export const Reply: MisskeyEntity.NotificationType = 'reply'
  export const Renote: MisskeyEntity.NotificationType = 'renote'
  export const Quote: MisskeyEntity.NotificationType = 'quote'
  export const Reaction: MisskeyEntity.NotificationType = 'reaction'
  export const PollVote: MisskeyEntity.NotificationType = 'pollVote'
  export const ReceiveFollowRequest: MisskeyEntity.NotificationType = 'receiveFollowRequest'
  export const FollowRequestAccepted: MisskeyEntity.NotificationType = 'followRequestAccepted'
  export const GroupInvited: MisskeyEntity.NotificationType = 'groupInvited'
}

export default MisskeyNotificationType
