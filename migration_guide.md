# Upgrade v2.x to v3.0.0

## Overview
`megalodon` start Misskey support in version 3.0.0.
In this update, there are few breaking changes, so please read this migration guide if you are using megalodon v2.x.

There are three changes,

1. Move class methods in Mastodon
2. I prepare methods to call each Mastodon APIs
3. Changed default export function



## Move class methods in Mastodon
In [#180](https://github.com/h3poteto/megalodon/pull/180), these methods are moved and changed to instance methods:

- `registerApp`
- `createApp`
- `generateAuthUrl`
- `fetchAccessToken`
- `refreshToken`

So please call these methods from Mastodon like:

```typescript
import { Mastodon } from 'megalodon'

const client = new Mastodon(...)
client.registerApp('TestApp')
```

## I prepare methods to call each Mastodon APIs
In v2.x, probably you use `megalodon` like:

```typescript
import Mastodon from 'megalodon'

const client = new Mastodon(...)

client.get('/api/v1/timelines/home')

```

But these methods are deprecated, and are not exported from `megalodon` package.
I prepared methods instead of these.

There are all methods to call Mastodon APIs, so please use it.

```typescript
import { Mastodon } from 'megalodon'

const client = new Mastodon(...)

client.getHomeTimeline()
```

Please refer `megalodon` [document](https://h3poteto.github.io/megalodon/) for methods.

## Changed default export function
`megalodon` export `generator` function as default.
This function generate Client API instance for specified SNS.

```typescript
import generator from 'megalodon'

const client = generator(sns_name, url, access_token)
```

Now support `mastodon`, `pleroma` and `misskey` as sns parameter.


And detector function is defined.
This function detect which SNS's URL is provided.
It returns SNS name, `mastodon`, `pleroma` or `misskey`.

```typescript
import { detector } from 'megalodon'

const sns = await detector('https://mastodon.social')
```

These functions are necessary to treat multiple SNS.
The smart way to call multiple SNS endpoint in same interface is:

```typescript
import generator, { detector } from 'megalodon'

const sns = await detector(url)
const client = generator(sns, url, access_token)

client.getHomeTimeline()
```
