import APIClient from '@/mastodon/api_client'

export function cancel(client: APIClient) {
  return client.cancel()
}
