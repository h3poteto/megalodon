import Mastodon from '@/mastodon'

export function cancel(client: Mastodon) {
  return client.cancel()
}
