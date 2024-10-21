import { detector } from '../../src/index'

describe('detector', () => {
  describe('mastodon', () => {
    const url = 'https://mastodon.social'
    it('should be mastodon', async () => {
      const mastodon = await detector(url)
      expect(mastodon).toEqual('mastodon')
    })
  })

  describe('pleroma', () => {
    const url = 'https://pleroma.io'
    it('should be pleroma', async () => {
      const pleroma = await detector(url)
      expect(pleroma).toEqual('pleroma')
    })
  })

  describe('fedibird', () => {
    const url = 'https://fedibird.com'
    it('should be mastodon', async () => {
      const fedibird = await detector(url)
      expect(fedibird).toEqual('mastodon')
    }, 20000)
  })

  describe('friendica', () => {
    const url = 'https://squeet.me'
    it('should be friendica', async () => {
      const friendica = await detector(url)
      expect(friendica).toEqual('friendica')
    })
  })

  describe('akkoma', () => {
    const url = 'https://blob.cat'
    it('should be akkoma', async () => {
      const akkoma = await detector(url)
      expect(akkoma).toEqual('pleroma')
    })
  })

  describe('firefish', () => {
    const url = 'https://cybre.club'
    it('should be firefish', async () => {
      const firefish = await detector(url)
      expect(firefish).toEqual('firefish')
    })
  })

  describe('gotosocial', () => {
    const url = 'https://scg.owu.one'
    it('should be gotosocial', async () => {
      const gotosocial = await detector(url)
      expect(gotosocial).toEqual('gotosocial')
    })
  })

  describe('kmy.blue', () => {
    const url = 'https://kmy.blue'
    it('should be mastodon', async () => {
      const kmyblue = await detector(url)
      expect(kmyblue).toEqual('mastodon')
    })
  })

  describe('unknown', () => {
    const url = 'https://google.com'
    it('should be null', async () => {
      const unknown = detector(url)
      await expect(unknown).rejects.toThrow()
    })
  })
})
