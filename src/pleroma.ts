import { MegalodonInterface, StreamListenerInterface, NoImplementedError } from './megalodon'
import Mastodon from './mastodon'
import Response from './response'
import Entity from './entity'
import PleromaAPI from './pleroma/api_client'

export default class Pleroma extends Mastodon implements MegalodonInterface {
  // ======================================
  // accounts
  // ======================================
  public async getAccountFavourites(
    id: string,
    limit?: number | null,
    max_id?: string | null,
    since_id?: string | null
  ): Promise<Response<Array<Entity.Status>>> {
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
    return this.client.get<Array<PleromaAPI.Entity.Status>>(`/api/v1/pleroma/accounts/${id}/favourites`, params).then(res => {
      return Object.assign(res, {
        data: res.data.map(s => PleromaAPI.Converter.status(s))
      })
    })
  }

  public async subscribeAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<PleromaAPI.Entity.Relationship>(`/api/v1/pleroma/accounts/${id}/subscribe`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.relationship(res.data)
      })
    })
  }

  public async unsubscribeAccount(id: string): Promise<Response<Entity.Relationship>> {
    return this.client.post<PleromaAPI.Entity.Relationship>(`/api/v1/pleroma/accounts/${id}/unsubscribe`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.relationship(res.data)
      })
    })
  }

  // ======================================
  // HTTP Streaming
  // ======================================
  public userStream(): StreamListenerInterface {
    throw new NoImplementedError('pleroma does not support')
  }

  public publicStream(): StreamListenerInterface {
    throw new NoImplementedError('pleroma does not support')
  }

  public localStream(): StreamListenerInterface {
    throw new NoImplementedError('pleroma does not support')
  }

  public tagStream(_tag: string): StreamListenerInterface {
    throw new NoImplementedError('pleroma does not support')
  }

  public listStream(_list_id: string): StreamListenerInterface {
    throw new NoImplementedError('pleroma does not support')
  }

  public directStream(): StreamListenerInterface {
    throw new NoImplementedError('pleroma does not support')
  }
}
