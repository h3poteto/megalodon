import Entity from './entity'

namespace NotificationType {
  export const Follow: Entity.NotificationType = 'follow'
  export const Favourite: Entity.NotificationType = 'favourite'
  export const Reblog: Entity.NotificationType = 'reblog'
  export const Mention: Entity.NotificationType = 'mention'
  export const EmojiReaction: Entity.NotificationType = 'emoji_reaction'
  export const FollowRequest: Entity.NotificationType = 'follow_request'
  export const Status: Entity.NotificationType = 'status'
  export const PollVote: Entity.NotificationType = 'poll_vote'
  export const PollExpired: Entity.NotificationType = 'poll_expired'
  export const Update: Entity.NotificationType = 'update'
  export const Move: Entity.NotificationType = 'move'
  export const AdminSignup: Entity.NotificationType = 'admin.sign_up'
  export const AdminReport: Entity.NotificationType = 'admin.report'
}

export class UnknownNotificationTypeError extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, UnknownNotificationTypeError.prototype)
  }
}

export default NotificationType
