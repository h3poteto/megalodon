/**
 * OAuth
 * Response data when oauth request.
 **/
namespace OAuth {
  export type AppData = {
    id: string
    name: string
    website: string | null
    redirect_uri: string | null
    client_id: string
    client_secret: string
    url: string | null
    session_token: string | null
  }

  export type TokenData = {
    access_token: string
    token_type: string
    scope: string | null
    created_at: number | null
    expires_in: number | null
    refresh_token: string | null
  }
}

export default OAuth
