import { OAuth2 } from 'oauth'
import OAuth from './oauth'
import { MegalodonInterface } from './megalodon'
import Mastodon from './mastodon'
import { NO_REDIRECT, DEFAULT_SCOPE } from './default'
import Response from './response'

export default class Pixelfed extends Mastodon implements MegalodonInterface {
  public async registerApp(
    client_name: string,
    options: Partial<{ scopes: Array<string>; redirect_uris: string; website: string }> = {
      scopes: DEFAULT_SCOPE,
      redirect_uris: NO_REDIRECT
    }
  ): Promise<OAuth.AppData> {
    return this.createApp(client_name, options).then(async appData => {
      return this.generateAuthUrl(appData.client_id, appData.client_secret, {
        scope: options.scopes,
        redirect_uri: appData.redirect_uri
      }).then(url => {
        appData.url = url
        return appData
      })
    })
  }

  /**
   * Call /api/v1/apps
   *
   * Create an application.
   * @param client_name your application's name
   * @param options Form Data
   */
  public async createApp(
    client_name: string,
    options: Partial<{ scopes: Array<string>; redirect_uris: string; website: string }> = {
      redirect_uris: NO_REDIRECT,
      scopes: DEFAULT_SCOPE
    }
  ): Promise<OAuth.AppData> {
    const redirect_uris = options.redirect_uris || NO_REDIRECT
    const scopes = options.scopes || DEFAULT_SCOPE

    const params: {
      client_name: string
      redirect_uris: string
      scopes: Array<string>
      website?: string
    } = {
      client_name: client_name,
      redirect_uris: redirect_uris,
      scopes: scopes
    }
    if (options.website) params.website = options.website

    return this.client
      .post<OAuth.AppDataFromServer>('/api/v1/apps', params)
      .then((res: Response<OAuth.AppDataFromServer>) => OAuth.AppData.from(res.data))
  }

  /**
   * Generate authorization url using OAuth2.
   *
   * @param clientId your OAuth app's client ID
   * @param clientSecret your OAuth app's client Secret
   * @param options as property, redirect_uri and scope are available, and must be the same as when you register your app
   */
  public generateAuthUrl(
    clientId: string,
    clientSecret: string,
    options: Partial<{ scope: Array<string>; redirect_uri: string }> = {
      redirect_uri: NO_REDIRECT,
      scope: DEFAULT_SCOPE
    }
  ): Promise<string> {
    return new Promise(resolve => {
      const oauth = new OAuth2(clientId, clientSecret, this.baseUrl, undefined, '/oauth/token')
      const url = oauth.getAuthorizeUrl(
        Object.assign(
          {
            redirect_uri: options.redirect_uri,
            response_type: 'code',
            client_id: clientId
          },
          ...options.scope!.map((s, i) => ({ [`scope[${i}]`]: s }))
        )
      )
      resolve(url)
    })
  }
}
