# Megalodon

[![Test](https://github.com/h3poteto/megalodon/workflows/Test/badge.svg)](https://github.com/h3poteto/megalodon/actions?query=branch%3Amaster+workflow%3ATest)
[![NPM Version](https://img.shields.io/npm/v/megalodon.svg)](https://www.npmjs.com/package/megalodon)
[![GitHub release](https://img.shields.io/github/release/h3poteto/megalodon.svg)](https://github.com/h3poteto/megalodon/releases)
[![npm](https://img.shields.io/npm/dm/megalodon)](https://www.npmjs.com/package/megalodon)
[![NPM](https://img.shields.io/npm/l/megalodon)](/LICENSE.txt)

Megalodon is a Fediverse API client library for [NodeJS](https://nodejs.org) and browsers.
This library allows for interfacing with [Mastodon](https://joinmastodon.org), [Pleroma](https://pleroma.social), [Friendica](https://friendi.ca), and [Firefish](https://joinfirefish.org) servers all with the same interface, providing REST API and streaming methods.

The Rust version is [megalodon-rs](https://github.com/h3poteto/megalodon-rs).

## Supports

- [x] Mastodon <img src="https://cdn.simpleicons.org/mastodon" alt="Mastodon" width=16 height=16>
- [x] Pleroma <img src="https://cdn.simpleicons.org/pleroma" alt="Pleroma" width=16 height=16>
- [x] Friendica
- [x] Firefish <img src="https://cdn.simpleicons.org/firefish" alt="Firefish" width=16 height=16>
- [x] Gotosocial
- [x] Akkoma (Unofficial)

## Features

- [x] REST API
- [ ] Admin API
- [x] WebSocket for streaming
- [x] Promisified methods
- [x] NodeJS and browser support
- [x] Written in TypeScript

## Install

```sh
# npm
npm install -S megalodon

# pnpm
pnpm add megalodon

# yarn
yarn add megalodon
```

## Usage

There are code [examples](https://github.com/h3poteto/megalodon/tree/master/example), abd  please refer to the [documentation](https://h3poteto.github.io/megalodon/) about each method.

I explain some typical methods.
At first, please get your access token for a fediverse server.
If you don't have access token, or you want to register applications and get access token programmably, please refer [Authorization section](#authorization).

### Home timeline

```ts
import generator, { Entity, Response } from 'megalodon'

const BASE_URL: string = 'https://mastodon.social'
const access_token: string = '...'

const client = generator('mastodon', BASE_URL, access_token)
client.getHomeTimeline()
  .then((res: Response<Array<Entity.Status>>) => {
    console.log(res.data)
  })
```

### Make a post

```ts
import generator, { Entity, Response } from 'megalodon'

const BASE_URL: string = 'https://mastodon.social'
const access_token: string = '...'
const post: string = 'test post'

const client = generator('mastodon', BASE_URL, access_token)
client.postStatus(post)
  .then((res: Response<Entity.Status>) => {
    console.log(res.data)
  })
```

### Post media

Please provide a file to the argument.

```ts
import generator, { Entity, Response } from 'megalodon'
import fs from 'fs'

const BASE_URL: string = 'https://mastodon.social'
const access_token: string = '...'
const image = fs.readFileSync("test-image.png")

const client = generator('mastodon', BASE_URL, access_token)
client.uploadMedia(image)
  .then((res: Response<Entity.Attachment>) => {
    console.log(res.data)
  })
```

### WebSocket streaming

```ts
import generator, { Entity } from 'megalodon'

const BASE_URL: string = 'https://pleroma.io'
const access_token: string = '...'

const client = generator('pleroma', BASE_URL, access_token)
client.userStreaming().then(stream => {
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
})
```

### Authorization

You can register applications and/or get access tokens to use this method.

```ts
import generator, { OAuth } from 'megalodon'

const BASE_URL: string = 'https://mastodon.social'

let clientId: string
let clientSecret: string

const client = generator('mastodon', BASE_URL)

client.registerApp('Test App')
  .then(appData => {
    clientId = appData.client_id
    clientSecret = appData.client_secret
    console.log('Authorization URL is generated.')
    console.log(appData.url)
  })
```

Please open `Authorization URL` in your browser, and authorize this app.
In this time, you can get authorization code.

After that, get an access token.

```ts
const code = '...' // Authorization code

client.fetchAccessToken(clientId, clientSecret, code)
  .then((tokenData: OAuth.TokenData) => {
    console.log(tokenData.access_token)
    console.log(tokenData.refresh_token)
  })
  .catch((err: Error) => console.error(err))
```

### Detect each server's software

You have to provide the server's software name (e.g. `mastodon`, `pleroma`, `firefish`) to the `generator` function.
But when you only know the URL and not the software the server runs on, the `detector` function can detect the server's software.

```ts
import { detector } from 'megalodon'

const FIRST_URL = 'https://mastodon.social'
const SECOND_URL = 'https://firefish.social'

const first_server = await detector(MASTODON_URL)
const second_server = await detector(FIREFISH_URL)

console.log(first_server) // mastodon
console.log(second_server) // firefish
```

## License

The software is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
