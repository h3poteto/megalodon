import APIClient from '@/api_client'

export function cancel(client: APIClient) {
  return client.cancel()
}
