import OAuth from '@/oauth.js'

export type AppDataFromServer = {
  id: string
  name: string
  website: string | null
  redirect_uri: string
  client_id: string
  client_secret: string
}

export type TokenDataFromServer = {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  created_at: number
}

export function toAppData(appData: AppDataFromServer): OAuth.AppData {
  return {
    id: appData.id,
    name: appData.name,
    website: appData.website,
    redirect_uri: appData.redirect_uri,
    client_id: appData.client_id,
    client_secret: appData.client_secret,
    url: null,
    session_token: null
  }
}

export function toTokenData(tokenData: TokenDataFromServer): OAuth.TokenData {
  return {
    access_token: tokenData.access_token,
    token_type: tokenData.token_type,
    scope: '',
    created_at: tokenData.created_at,
    expires_in: tokenData.expires_in,
    refresh_token: tokenData.refresh_token
  }
}
