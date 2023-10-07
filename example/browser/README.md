At first, set environment vairables

```
$ export MASTODON_URL=wss://mastodon.social
$ export MASTODON_ACCESS_TOKEN=foobar
```
And execute

```
$ yarn workspace megalodon build
$ yarn workspace browser build
$ yarn workspace browser start
```

Let's open `http://127.0.0.1:8000`.
