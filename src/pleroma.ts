import MegalodonInterface, { NoImplementedError } from './megalodon'
import Mastodon from './mastodon'
import StreamListener from './mastodon/stream_listener'
import APIClient from './pleroma/api_client'
import Response from './response'
import { Status } from './entities/status'
import { Relationship } from './entities/relationship'

export default class Pleroma extends Mastodon implements MegalodonInterface {
  /**
   * GET /api/pleroma/healthcheck
   */
  public static healthcheck(): Promise<Response<{}>> {
    return APIClient.get<{}>('/api/pleroma/healthcheck')
  }

  // ======================================
  // accounts
  // ======================================
  /**
   * GET /api/v1/pleroma/accounts/:id/favourites
   *
   * @param id Target account ID.
   * @param limit Max number of results to return.
   * @param max_id Return results order than ID.
   * @param since_id Return results newer than ID.
   * @return Array of statuses.
   */
  public getAccountFavourites(
    id: string,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null
  ): Promise<Response<Array<Status>>> {
    let params = {}
    if (limit) {
      params = Object.assign(params, {
        limit: limit
      })
    }
    if (max_id) {
      params = Object.assign(params, {
        max_id: max_id
      })
    }
    if (since_id) {
      params = Object.assign(params, {
        since_id: since_id
      })
    }
    return this.client.get<Array<Status>>(`/api/v1/pleroma/accounts/${id}/favourites`, params)
  }

  /**
   * POST /api/v1/pleroma/accounts/:id/subscribe
   *
   * @param id Target account ID.
   * @return Relationship.
   */
  public subscribeAccount(id: string): Promise<Response<Relationship>> {
    return this.client.post<Relationship>(`/api/v1/pleroma/accounts/${id}/subscribe`)
  }

  /**
   * POST /api/v1/pleroma/accounts/:id/unsubscribe
   *
   * @param id Target account ID.
   * @return Relationship.
   */
  public unsubscribeAccount(id: string): Promise<Response<Relationship>> {
    return this.client.post<Relationship>(`/api/v1/pleroma/accounts/${id}/unsubscribe`)
  }

  // ======================================
  // HTTP Streaming
  // ======================================
  public userStream(): StreamListener {
    throw new NoImplementedError('pleroma does not support')
  }

  public publicStream(): StreamListener {
    throw new NoImplementedError('pleroma does not support')
  }

  public localStream(): StreamListener {
    throw new NoImplementedError('pleroma does not support')
  }

  public tagStream(_tag: string): StreamListener {
    throw new NoImplementedError('pleroma does not support')
  }

  public listStream(_list_id: string): StreamListener {
    throw new NoImplementedError('pleroma does not support')
  }

  public directStream(): StreamListener {
    throw new NoImplementedError('pleroma does not support')
  }
}
