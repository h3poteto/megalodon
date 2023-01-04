import { detector } from '../../src/index'

describe('detector', () => {
  describe('mastodon', () => {
    const url = 'https://fedibird.com'
    it('should be mastodon', async () => {
      const mastodon = await detector(url)
      expect(mastodon).toEqual('mastodon')
    })
  })

  describe('pleroma', () => {
    const url = 'https://pleroma.soykaf.com'
    it('should be pleroma', async () => {
      const pleroma = await detector(url)
      expect(pleroma).toEqual('pleroma')
    })
  })

  describe('misskey', () => {
    const url = 'https://misskey.io'
    it('should be misskey', async () => {
      const misskey = await detector(url)
      expect(misskey).toEqual('misskey')
    })
  })
})
