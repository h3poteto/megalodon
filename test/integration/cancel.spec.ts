import MastodonAPI from '@/mastodon/api_client'
import { Worker } from 'jest-worker'

jest.mock('axios', () => {
  const mockAxios = jest.requireActual('axios')
  mockAxios.get = (_path: string) => {
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('hoge')
        resolve({
          data: 'hoge',
          status: 200,
          statusText: '200OK',
          headers: [],
          config: {}
        })
      }, 5000)
    })
  }
  return mockAxios
})

const worker = async (client: MastodonAPI.Client) => {
  const w: any = new Worker(require.resolve('./cancelWorker.ts'))
  await w.cancel(client)
}

// Could not use jest-worker under typescript.
// I'm waiting for resolve this issue.
// https://github.com/facebook/jest/issues/8872
describe.skip('cancel', () => {
  const client = new MastodonAPI.Client('testToken', 'https://pleroma.io/api/v1')
  it('should be raised', async () => {
    const getPromise = client.get<{}>('/timelines/home')
    worker(client)
    await expect(getPromise).rejects.toThrow()
  })
})
