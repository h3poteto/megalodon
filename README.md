# Megalodon

A Mastodon API Client library for node.js. It provides REST API and streaming methods.


## Install

```
$ npm install -S megalodon
```

or

```
$ yarn add megalodon
```

## Useage
I prepared [examples](example).

## Authorization
First, you should register the application.

```typescript
import Mastodon from 'megalodon'

const SCOPES: string = 'read write follow'
const BASE_URL: string = 'https://friends.nico'

let clientId: string
let clientSecret: string

Mastodon.registerApp('Test App', {
  scopes: SCOPES
}, BASE_URL).then(appData => {
  clientId = appData.clientId
  clientSecret = appData.clientSecret
  console.log('Authorization URL is generated.')
  console.log(appData.url)
})
```

And, get an access token.

```typescript
const code = '...' // Authorization code

Mastodon.fetchAccessToken(clientId, clientSecret, code, BASE_URL)
})
  .then((tokenData: Partial<{ accessToken: string }>) => {
    console.log(tokenData.accessToken)
  })
  .catch((err: Error) => console.error(err))
```

## Get timeline

```typescript
import Mastodon from 'megalodon'

const BASE_URL: string = 'https://friends.nico'

const access_token: string = '...'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

client.get('/timelines/home')
  .then(resp => console.log(resp))
```

## Post toot

```typescript
import Mastodon from 'megalodon'

const BASE_URL: string = 'https://friends.nico'

const access_token: string = '...'

const toot: string = 'test toot'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

client.post('/statuses', {
  status: toot
})
  .then(res => {
    console.log(res)
  })

```

## Streaming

```typescript
import Mastodon from 'megalodon'

const BASE_URL: string = 'https://friends.nico'

const access_token: string = '...'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

const stream = client.stream('/streaming/public')
stream.on('message', (data) => {
  console.log(data)
})

stream.on('error', (err) => {
  console.error(err)
})

stream.on('heartbeat', () => {
  console.log('thump.')
})
```

## License

The software is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
