# Megalodon
[![Test](https://github.com/h3poteto/megalodon/workflows/Test/badge.svg)](https://github.com/h3poteto/megalodon/actions?query=branch%3Amaster+workflow%3ATest)
[![NPM Version](https://img.shields.io/npm/v/megalodon.svg)](https://www.npmjs.com/package/megalodon)
[![GitHub release](https://img.shields.io/github/release/h3poteto/megalodon.svg)](https://github.com/h3poteto/megalodon/releases)
[![npm](https://img.shields.io/npm/dm/megalodon)](https://www.npmjs.com/package/megalodon)
[![NPM](https://img.shields.io/npm/l/megalodon)](/LICENSE.txt)

A Mastodon, Pleroma and Misskey API Client library for node.js and browser. It provides REST API and streaming methods.
By using this library, you can take Mastodon, Pleroma and Misskey with the same interface.

## !!Migrate v2.x to v3.0.0
There are some breaking changes, so you can not update megalodon out of the box.
Please refer [migration guide](migration_guide.md) before you update megalodon version.

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
I prepared [examples](example), and please refer [documents](https://h3poteto.github.io/megalodon/) about each methods.

I explain some typical methods.
At first, please get your access token for a fediverse server.
If you don't have access token, or you want to register applications and get access token programmably, please refer [Authorization section](#authorization).


### Home timeline

```typescript
import generator, { Entity, Response } from 'megalodon'

const BASE_URL: string = 'https://mastodon.social'
const access_token: string = '...'

const client = generator('mastodon', BASE_URL, access_token)
client.getHomeTimeline()
  .then((res: Response<Array<Entity.Status>>) => {
    console.log(res.data)
  })
```

### Post toot

```typescript
import generator, { Entity, Response } from 'megalodon'

const BASE_URL: string = 'https://mastodon.social'
const access_token: string = '...'
const toot: string = 'test toot'

const client = generator('mastodon', BASE_URL, access_token)
client.postStatus(toot)
  .then((res: Response<Entity.Status>) => {
    console.log(res.data)
  })
```

### Post medias
Please provide a file to the argument.

```typescript
import generator, { Entity, Response } from 'megalodon'
import fs from 'fs'

const BASE_URL: string = 'https://mastodon.social'
const access_token: string = '...'
const image = fs.readFileSync("test.image")

const client = generator('mastodon', BASE_URL, access_token)
client.uploadMedia(image)
  .then((res: Response<Entity.Attachment>) => {
    console.log(res.data)
  })
```

### WebSocket streaming
Mastodon, Pleroma and Misskey provide WebSocket for streaming.

```typescript
import generator, { Entity, WebSocketInterface } from 'megalodon'

const BASE_URL: string = 'wss://pleroma.io'
const access_token: string = '...'

const client = generator('pleroma', BASE_URL, access_token)
const stream: WebSocketInterface = client.userSocket()

stream.on('connect', () => {
  console.log('connect')
})

stream.on('update', (status: Entity.Status) => {
  console.log(status)
})

stream.on('notification', (notification: Entity.Notification) => {
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

### HTTP Streaming
Mastodon provides HTTP streaming.

```typescript
import generator, { Entity, StreamListenerInterface } from 'megalodon'

const BASE_URL: string = 'https://mastodon.social'
const access_token: string = '...'

const client = generator('mastodon', BASE_URL, access_token)
const stream: StreamListenerInterface

stream.on('update', (status: Entity.Status) => {
  console.log(status)
})

stream.on('notification', (notification: Entity.Notification) => {
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


### Authorization
You can register applications, and get access tokens to use this method.

```typescript
import generator, { OAuth } from 'megalodon'

const BASE_URL: string = 'https://mastodon.social'

let clientId: string
let clientSecret: string

const client = generator('mastodon', BASE_URL)

client.registerApp('Test App')
  .then(appData => {
    clientId = appData.clientId
    clientSecret = appData.clientSecret
    console.log('Authorization URL is generated.')
    console.log(appData.url)
  })
```

Please open `Autorhization URL` in your browser, and authorize this app.
In this time, you can get authorization code.

After that, get an access token.

```typescript
const code = '...' // Authorization code

client.fetchAccessToken(clientId, clientSecret, code)
})
  .then((tokenData: OAuth.TokenData) => {
    console.log(tokenData.accessToken)
    console.log(tokenData.refreshToken)
  })
  .catch((err: Error) => console.error(err))
```

### Detect each SNS
You have to provide SNS name `mastodon`, `pleroma` or `misskey` to `generator` function.
But when you only know the URL and not the SNS, `detector` function can detect the SNS.

```typescript
import { detector } from 'megalodon'

const URL = 'https://misskey.io'

const sns = await detector(URL)
console.log(sns)
```

## License

The software is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
