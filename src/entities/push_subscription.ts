export default interface PushSubscription {
  id: number,
  endpoint: string,
  server_key: string,
  alerts: object
}
