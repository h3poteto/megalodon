import { Emoji } from './emoji'

export type Meta = {
  maintainerName: string | null
  maintainerEmail: string | null
  name: string
  version: string
  uri: string
  description: string | null
  langs: Array<string>
  disableRegistration: boolean
  disableLocalTimeline: boolean
  bannerUrl: string
  maxNoteTextLength: number
  emojis: Array<Emoji>
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
