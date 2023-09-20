import FirefishEntity from './entity'

namespace FirefishNotificationType {
  export const Follow: FirefishEntity.NotificationType = 'follow'
  export const Mention: FirefishEntity.NotificationType = 'mention'
  export const Reply: FirefishEntity.NotificationType = 'reply'
  export const Renote: FirefishEntity.NotificationType = 'renote'
  export const Quote: FirefishEntity.NotificationType = 'quote'
  export const Reaction: FirefishEntity.NotificationType = 'reaction'
  export const PollVote: FirefishEntity.NotificationType = 'pollVote'
  export const PollEnded: FirefishEntity.NotificationType = 'pollEnded'
  export const ReceiveFollowRequest: FirefishEntity.NotificationType = 'receiveFollowRequest'
  export const FollowRequestAccepted: FirefishEntity.NotificationType = 'followRequestAccepted'
  export const GroupInvited: FirefishEntity.NotificationType = 'groupInvited'
  export const App: FirefishEntity.NotificationType = 'app'
}

export default FirefishNotificationType
