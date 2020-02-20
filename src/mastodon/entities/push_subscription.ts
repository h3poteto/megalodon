namespace MastodonEntity {
  export type PushSubscription = {
    id: string
    endpoint: string
    server_key: string
    alerts: object
  }
}
