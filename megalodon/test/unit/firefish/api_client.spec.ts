import FirefishAPI from '@/firefish/api_client'
import MegalodonEntity from '@/entity'

describe('api_client', () => {
  describe('mapReactions', () => {
    it('should work', () => {
      const emojis: Array<FirefishAPI.Entity.Emoji> = [
        {
          name: 'foxverified',
          url: 'https://example.com/files/foxverified',
          category: null
        },
        {
          name: 'verificado',
          url: 'https://example.com/files/verificado',
          category: null
        },
        {
          name: 'kawaii@firefish.example',
          url: 'https://example.com/proxy/firefishexample/kawaii',
          category: null
        },
        {
          name: 'ablobcatnodfast@.',
          url: 'https://example.com/files/ablobcatnodfast',
          category: null
        }
      ]
      const reactions: { [key: string]: number } = {
        ':ablobcatnodfast@.:': 2,
        ':kawaii@firefish.example:': 1
      }

      const res = FirefishAPI.Converter.mapReactions(emojis, reactions)
      expect(res).toHaveLength(2)
      expect(res).toContainEqual({
        count: 2,
        me: false,
        name: 'ablobcatnodfast',
        url: 'https://example.com/files/ablobcatnodfast',
        static_url: 'https://example.com/files/ablobcatnodfast'
      } as MegalodonEntity.Reaction)

      expect(res).toContainEqual({
        count: 1,
        me: false,
        name: 'kawaii@firefish.example',
        url: 'https://example.com/proxy/firefishexample/kawaii',
        static_url: 'https://example.com/proxy/firefishexample/kawaii'
      } as MegalodonEntity.Reaction)
    })
    it('does not have emojis', () => {
      const emojis: Array<FirefishAPI.Entity.Emoji> = []
      const reactions: { [key: string]: number } = {
        ':ablobcatnodfast@.:': 2,
        ':kawaii@firefish.example:': 1
      }

      const res = FirefishAPI.Converter.mapReactions(emojis, reactions)
      expect(res).toHaveLength(2)
      expect(res).toContainEqual({
        count: 2,
        me: false,
        name: 'ablobcatnodfast'
      } as MegalodonEntity.Reaction)

      expect(res).toContainEqual({
        count: 1,
        me: false,
        name: 'kawaii@firefish.example'
      } as MegalodonEntity.Reaction)
    })
    it('reactions with me', () => {
      const emojis: Array<FirefishAPI.Entity.Emoji> = [
        {
          name: 'foxverified',
          url: 'https://example.com/files/foxverified',
          category: null
        },
        {
          name: 'verificado',
          url: 'https://example.com/files/verificado',
          category: null
        },
        {
          name: 'kawaii@firefish.example',
          url: 'https://example.com/proxy/firefishexample/kawaii',
          category: null
        },
        {
          name: 'ablobcatnodfast@.',
          url: 'https://example.com/files/ablobcatnodfast',
          category: null
        }
      ]
      const reactions: { [key: string]: number } = {
        ':ablobcatnodfast@.:': 2,
        ':kawaii@firefish.example:': 1
      }

      const res = FirefishAPI.Converter.mapReactions(emojis, reactions, ':ablobcatnodfast@.:')
      expect(res).toHaveLength(2)
      expect(res).toContainEqual({
        count: 2,
        me: true,
        name: 'ablobcatnodfast',
        url: 'https://example.com/files/ablobcatnodfast',
        static_url: 'https://example.com/files/ablobcatnodfast'
      } as MegalodonEntity.Reaction)

      expect(res).toContainEqual({
        count: 1,
        me: false,
        name: 'kawaii@firefish.example',
        url: 'https://example.com/proxy/firefishexample/kawaii',
        static_url: 'https://example.com/proxy/firefishexample/kawaii'
      } as MegalodonEntity.Reaction)
    })
  })
})
