import WebSocket from 'ws'
import { randomUUID } from 'crypto'
import { IntercomIdentityType } from '../types'

type AddClientOptions = {
  identityType?: IntercomIdentityType
  ws: WebSocket
}

type Client = {
  uuid: string
  shortUuid: string
  identityType: IntercomIdentityType
  ws: WebSocket
}

type Clients = { [uuid: string]: Client }

type ClientStore = {
  clients: { [identityType in IntercomIdentityType]: Clients }
  allClients: Clients
  count: number
  add: (options: AddClientOptions) => Client
  identify: (uuid: string, identityType: IntercomIdentityType) => void
  remove: (uuid: string) => void
  getClientList: (identityType?: IntercomIdentityType) => Client[]
}

export const createClientStore = () => {
  let instance: ClientStore

  return instance = {
    clients: {
      CLI: { },
      CLIENT_WATCH: { },
      COMP_LIB_WATCH: { },
      SITE_CLIENT: { },
      SITE_SERVER: { },
      ANONYMOUS: { },
    },
    allClients: {},
    count: 0,
    getClientList: identityType => (identityType != null
      ? Object.values(instance.clients[identityType])
      : Object.values(instance.allClients)),
    add: options => {
      const uuid = randomUUID()
      const client: Client = {
        uuid,
        ws: options.ws,
        identityType: options.identityType ?? IntercomIdentityType.ANONYMOUS,
        shortUuid: uuid.substring(0, 8), // Because that's what Docker does
      }
      instance.clients[client.identityType][client.uuid] = client
      instance.allClients[uuid] = client
      instance.count += 1
      return client
    },
    identify: (uuid: string, newIdentityType: IntercomIdentityType) => {
      const client = instance.allClients[uuid]
      if (client == null)
        return

      const identityType = client.identityType
      delete instance.clients[identityType][uuid]
      client.identityType = newIdentityType
      instance.clients[newIdentityType][uuid] = client
    },
    remove: uuid => {
      const client = instance.allClients[uuid]
      if (client == null)
        return
      const identityType = client.identityType
      delete instance.clients[identityType][uuid]
      delete instance.allClients[uuid]
      instance.count -= 1
    },
  }
}
