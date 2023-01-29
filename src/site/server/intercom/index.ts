import WebSocket, { WebSocketServer } from 'ws'
import { IntercomIdentityType, IntercomMessage, IntercomMessageType } from '../../../common/intercom/types'
import { logIntercomInfo } from '../../../common/logging'
import { createClientStore } from './clientStore'

const PREFERRED_PORT = 8000

export const initIntercom = () => {
  logIntercomInfo('Creating Intercom server')
  const wss = new WebSocketServer({ port: PREFERRED_PORT })

  const clientStore = createClientStore()

  const broadcastMessage = (msg: IntercomMessage) => {
    clientStore.getClientList(msg.to).forEach(client => {
      if (client.ws.readyState !== WebSocket.OPEN)
        return
      client.ws.send(JSON.stringify(msg))
    })
  }

  wss.on('connection', ws => {
    const client = clientStore.add({ ws })

    logIntercomInfo(c => `${c.green('Client connected')} (${client.shortUuid}) (${clientStore.count} clients).`)

    ws.on('message', data => {
      const dataStr = String(data)
      const msg = JSON.parse(dataStr) as IntercomMessage

      logIntercomInfo(c => `Recieved message from ${c.bold(client.identityType)} (${client.shortUuid}). Message: ${c.cyan(dataStr)}`)

      if (client.identityType === IntercomIdentityType.ANONYMOUS) {
        clientStore.identify(client.uuid, msg.from)
        logIntercomInfo(c => `Identified client ${client.shortUuid} as ${c.bold(msg.from)}`)
      }

      if (msg.type === IntercomMessageType.IDENTIFY)
        return

      if (msg.to === IntercomIdentityType.SITE_SERVER)
        return // We don't yet have a need for this

      broadcastMessage(msg)
    })

    ws.on('close', code => {
      clientStore.remove(client.uuid)
      logIntercomInfo(c => `${c.red(`${c.bold(client.identityType)} (${client.shortUuid}) disconnected`)} (${clientStore.count} clients) (code: ${code}).`)
    })
  })
}
