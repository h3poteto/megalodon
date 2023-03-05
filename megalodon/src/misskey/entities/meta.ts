/// <reference path="emoji.ts" />

namespace MisskeyEntity {
  export type Meta = {
    maintainerName: string
    maintainerEmail: string
    name: string
    version: string
    uri: string
    description: string
    langs: Array<string>
    disableRegistration: boolean
    disableLocalTimeline: boolean
    bannerUrl: string
    maxNoteTextLength: number
    emojis: Array<Emoji>
    policies: {
      gtlAvailable: boolean
      ltlAvailable: boolean
      canPublicNote: boolean
      canInvite: boolean
      canManageCustomEmojis: boolean
      canHideAds: boolean
      driveCapacityMb: number
      pinLimit: number
      antennaLimit: number
      wordMuteLimit: number
      webhookLimit: number
      clipLimit: number
      noteEachClipsLimit: number
      userListLimit: number
      userEachUserListsLimit: number
      rateLimitFactor: number
    }
    features: {
      registration: boolean
      emailRequiredForSignup: boolean
      elasticsearch: boolean
      hcaptcha: boolean
      recaptcha: boolean
      turnstile: boolean
      objectStorage: boolean
      serviceWorker: boolean
      miauth: boolean
    }
  }
}
