import OAuth from '@/oauth'

export type AppDataFromServer = {
  id: string
  name: string
  callbackUrl: string | null
  permission: Array<string>
  secret?: string
  isAuthorized?: boolean
}

export type TokenDataFromServer = {
  accessToken: string
}

export function toAppData(appData: AppDataFromServer): OAuth.AppData {
  return {
    id: appData.id,
    name: appData.name,
    website: null,
    redirect_uri: appData.callbackUrl,
    client_id: '',
    client_secret: appData.secret ?? '',
    url: null,
    session_token: null
  }
}

export function toTokenData(tokenData: TokenDataFromServer): OAuth.TokenData {
  return {
    access_token: tokenData.accessToken,
    token_type: 'Firefish',
    scope: null,
    created_at: null,
    expires_in: null,
    refresh_token: null
  }
}
