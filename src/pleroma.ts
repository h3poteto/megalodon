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
    options?: {
      limit?: number
      max_id?: string
      since_id?: string
    }
  ): Promise<Response<Array<Entity.Status>>> {
    let params = {}
    if (options) {
      if (options.limit) {
        params = Object.assign(params, {
          limit: options.limit
        })
      }
      if (options.max_id) {
        params = Object.assign(params, {
          max_id: options.max_id
        })
      }
      if (options.since_id) {
        params = Object.assign(params, {
          since_id: options.since_id
        })
      }
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
  // Emoji reactions
  // ======================================
  public async createEmojiReaction(id: string, emoji: string): Promise<Response<Entity.Status>> {
    return this.client.put<PleromaAPI.Entity.Status>(`/api/v1/pleroma/statuses/${id}/reactions/${emoji}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  public async deleteEmojiReaction(id: string, emoji: string): Promise<Response<Entity.Status>> {
    return this.client.del<PleromaAPI.Entity.Status>(`/api/v1/pleroma/statuses/${id}/reactions/${emoji}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.status(res.data)
      })
    })
  }

  public async getEmojiReactions(id: string): Promise<Response<Array<Entity.Reaction>>> {
    return this.client.get<Array<PleromaAPI.Entity.Reaction>>(`/api/v1/pleroma/statuses/${id}/reactions`).then(res => {
      return Object.assign(res, {
        data: res.data.map(r => PleromaAPI.Converter.reaction(r))
      })
    })
  }

  public async getEmojiReaction(id: string, emoji: string): Promise<Response<Entity.Reaction>> {
    return this.client.get<PleromaAPI.Entity.Reaction>(`/api/v1/pleroma/statuses/${id}/reactions/${emoji}`).then(res => {
      return Object.assign(res, {
        data: PleromaAPI.Converter.reaction(res.data)
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
