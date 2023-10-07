export type App = {
  id: string
  name: string
  callbackUrl: string | null
  permission: Array<string>
  secret?: string
  isAuthorized?: boolean
}
