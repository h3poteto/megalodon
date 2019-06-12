const Mastodon = require('../../lib/mastodon')

const BASE_URL = 'https://mstdn.jp'

const access_token = process.env.MASTODON_ACCESS_TOKEN

const client = new Mastodon(access_token, BASE_URL + '/api/v1')

client.get('/timelines/home').then(res => console.log(res.data))
