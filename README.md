## Warning
This fork isnt yet feature complete with all calckey features and thus we recommend using other libraries over this for the time being. Thanks to everyone who helps make this a better library.

# Megalodon
[![NPM Version](https://img.shields.io/npm/v/@calckey/megalodon)](https://www.npmjs.com/package/@calckey/megalodon)
[![npm](https://img.shields.io/npm/dm/@calckey/megalodon)](https://www.npmjs.com/package/@calckey/megalodon)

A Fediverse API Client library for node.js and browser. It provides REST API and streaming methods.
By using this library, you can take Mastodon, Pleroma, Friendica, and Misskey with the same interface.

The Rust version is [megalodon-rs](https://github.com/h3poteto/megalodon-rs).

## Supports
- [x] Mastodon
- [x] Pleroma
- [x] Friendica
- [x] Misskey
- [x] Calckey

## Features
- [x] REST API
- [ ] Admin API
- [x] WebSocket for Streamings
- [x] Promisified methods
- [x] Proxy support
- [x] Support node.js and browser
- [x] Written in typescript

## Install

```sh
# npm
npm i megalodon

# pnpm
pnpm add megalodon

# yarn
yarn add megalodon
```

### Build for browser
**Important**: In browser, you can not use proxy.

If you want to build for browser, please use Webpack and set empty value for some libraries which are not supported in Node.js.
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
