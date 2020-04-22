import MisskeyAPI from '@/misskey/api_client'

describe('api_client', () => {
  describe('reactions', () => {
    it('should be mapped', () => {
      const misskeyReactions = [
        {
          id: '1',
          createdAt: '2020-04-21T13:04:13.968Z',
          user: {
            id: '81u70uwsja',
            name: 'h3poteto',
            username: 'h3poteto',
            host: null,
            avatarUrl: 'https://s3.arkjp.net/misskey/thumbnail-63807d97-20ca-40ba-9493-179aa48065c1.png',
            avatarColor: 'rgb(146,189,195)',
            emojis: []
          },
          type: '❤'
        },
        {
          id: '2',
          createdAt: '2020-04-21T13:04:13.968Z',
          user: {
            id: '81u70uwsja',
            name: 'h3poteto',
            username: 'h3poteto',
            host: null,
            avatarUrl: 'https://s3.arkjp.net/misskey/thumbnail-63807d97-20ca-40ba-9493-179aa48065c1.png',
            avatarColor: 'rgb(146,189,195)',
            emojis: []
          },
          type: '❤'
        },
        {
          id: '3',
          createdAt: '2020-04-21T13:04:13.968Z',
          user: {
            id: '81u70uwsja',
            name: 'h3poteto',
            username: 'h3poteto',
            host: null,
            avatarUrl: 'https://s3.arkjp.net/misskey/thumbnail-63807d97-20ca-40ba-9493-179aa48065c1.png',
            avatarColor: 'rgb(146,189,195)',
            emojis: []
          },
          type: '☺'
        },
        {
          id: '4',
          createdAt: '2020-04-21T13:04:13.968Z',
          user: {
            id: '81u70uwsja',
            name: 'h3poteto',
            username: 'h3poteto',
            host: null,
            avatarUrl: 'https://s3.arkjp.net/misskey/thumbnail-63807d97-20ca-40ba-9493-179aa48065c1.png',
            avatarColor: 'rgb(146,189,195)',
            emojis: []
          },
          type: '❤'
        }
      ]

      const reactions = MisskeyAPI.Converter.reactions(misskeyReactions)
      expect(reactions).toEqual([
        {
          count: 3,
          me: false,
          name: '❤'
        },
        {
          count: 1,
          me: false,
          name: '☺'
        }
      ])
    })
  })
})
