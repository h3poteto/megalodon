import MastodonAPI from '@/mastodon/api_client'

export function cancel(client: MastodonAPI.Client) {
  return client.cancel()
}
