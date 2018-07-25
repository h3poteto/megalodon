# Megalodon
[![Build Status](https://travis-ci.org/h3poteto/megalodon.svg)](https://travis-ci.org/h3poteto/megalodon)
[![NPM Version](https://img.shields.io/npm/v/megalodon.svg)](https://www.npmjs.com/package/megalodon)

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
import Mastodon, { Status, Response } from 'megalodon'

const BASE_URL: string = 'https://friends.nico'

const access_token: string = '...'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

client.get<[Status]>('/timelines/home')
  .then((resp: Response<[Status]>) => {
    console.log(resp.data)
  })
```

## Post toot

```typescript
import Mastodon, { Status, Response } from 'megalodon'

const BASE_URL: string = 'https://friends.nico'

const access_token: string = '...'

const toot: string = 'test toot'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

client.post<Status>('/statuses', {
  status: toot
})
  .then((res: Response<Status>) => {
    console.log(res.data)
  })

```

## Streaming

```typescript
import Mastodon, { Status, Notification, StreamListener } from 'megalodon'

const BASE_URL: string = 'https://friends.nico'

const access_token: string = '...'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)


const stream: StreamListener = client.stream('/streaming/public')
stream.on('update', (status: Status) => {
  console.log(status)
})

stream.on('notification', (notification: Notification) => {
  console.log(notification)
})

stream.on('delete', (id: number) => {
  console.log(id)
})

stream.on('error', (err: Error) => {
  console.error(err)
})

stream.on('heartbeat', () => {
  console.log('thump.')
})
```

## License

The software is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
