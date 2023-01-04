namespace Entity {
  export type PushSubscription = {
    id: string
    endpoint: string
    server_key: string
    alerts: Alerts
  }

  export type Alerts = {
    follow: boolean
    favourite: boolean
    mention: boolean
    reblog: boolean
    poll: boolean
  }
}
