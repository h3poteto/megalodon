# Megalodon
[![Build Status](https://travis-ci.com/h3poteto/megalodon.svg?branch=master)](https://travis-ci.com/h3poteto/megalodon)
[![NPM Version](https://img.shields.io/npm/v/megalodon.svg)](https://www.npmjs.com/package/megalodon)
[![GitHub release](https://img.shields.io/github/release/h3poteto/megalodon.svg)](https://github.com/h3poteto/megalodon/releases)
[![npm](https://img.shields.io/npm/dm/megalodon)](https://www.npmjs.com/package/megalodon)
[![NPM](https://img.shields.io/npm/l/megalodon)](/LICENSE.txt)

A Mastodon and Pleroma API Client library for node.js and browser. It provides REST API and streaming methods.

## Features

- REST API
- Streaming with Server-Sent Event
- Streaming with WebSocket
- Promisified methods
- Proxy support
- Support node.js and browser
- Written in typescript

## Install

```
$ npm install -S megalodon
```

or

```
$ yarn add megalodon
```

### Build for browser
**Important**: In browser, you can not use proxy.

If you want to build for browser, please use Webpack and set empty value for these libraries.

- net
- tls
- dns

```javascript
  node: {
    net: 'empty',
    tls: 'empty',
    dns: 'empty'
  }
```

These libraries are for node.js, so can not use in browser.

[Here](example/browser/webpack.config.js) is example Webpack configuration.

## Usage
I prepared [examples](example).

### Authorization
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

### Get timeline

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

### Post toot

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

### Post medias
The POST method is wrapper of [axios](https://github.com/axios/axios): https://github.com/h3poteto/megalodon/blob/master/src/mastodon.ts#L245-L266

So you can use the same way of axios to post medias.

```typescript
import Mastodon, { Status, Response } from 'megalodon'
import fs from 'fs'

const BASE_URL: string = 'https://friends.nico'

const access_token: string = '...'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

const image = fs.readFileSync("test.image")
const formData = new FormData()
formData.append('file', image)

client.post<Attachment>('/media', formData)
  .then((res: Response<Attachment>) => {
    console.log(res.data)
  })
```



### Streaming for Mastodon
This method provides streaming method for Mastodon. If you want to use Pleroma, [please use WebSocket](#websocket-for-pleroma).

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
### WebSocket for Pleroma
This method provides streaming method for Pleroma.

```typescript
import Mastodon, { Status, Notification, WebSocket } from 'megalodon'

const BASE_URL: string = 'wss://pleroma.io'

const access_token: string = '...'

const client = new Mastodon(
  access_token,
  BASE_URL + '/api/v1'
)

const stream: WebSocket = client.socket('/streaming', 'user')
stream.on('connect', () => {
  console.log('connect')
})

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

stream.on('close', () => {
  console.log('close')
})

stream.on('parser-error', (err: Error) => {
  console.error(err)
})
```

## License

The software is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
