import WebSocket, { WebSocketServer } from 'ws'
import { DEFAULT_INTERCOM_PORT, INTERCOM_PORT_ENV_VAR_NAME } from '../../../common/intercom'
import { IntercomIdentityType, IntercomMessage, IntercomMessageType } from '../../../common/intercom/types'
import { logIntercomInfo } from '../../../common/logging'
import { createClientStore } from './clientStore'

export const initIntercom = () => {
  const host = process.env.EXH_SITE_SERVER_HOST
  const port = process.env[INTERCOM_PORT_ENV_VAR_NAME] != null ? parseInt(process.env[INTERCOM_PORT_ENV_VAR_NAME]) : DEFAULT_INTERCOM_PORT
  console.log(process.env.EXH_SHOW_INTERCOM_LOG)
  logIntercomInfo(c => `Creating Intercom server on ${c.cyan(`${host}:${port}`)}`)
  const wss = new WebSocketServer({ host, port })

  const clientStore = createClientStore()

  const broadcastMessage = (msg: IntercomMessage) => {
    // Send the message to all clients of the identity type of the message's "to" property.
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
        if (msg.from == null)
          logIntercomInfo(c => `Anonymous message from ${client.shortUuid} had no 'from' property. Who is this? Message: ${c.cyan(dataStr)}`)
        clientStore.identify(client.uuid, msg.from)
        logIntercomInfo(c => `Identified client ${client.shortUuid} as ${c.bold(msg.from)}`)
      }

      if (msg.type === IntercomMessageType.IDENTIFY)
        return

      if (msg.to === IntercomIdentityType.SITE_SERVER)
        return // The server doesn't yet have any need for recieved messages other than the IDENTITY one

      broadcastMessage(msg)
    })

    ws.on('close', code => {
      clientStore.remove(client.uuid)
      logIntercomInfo(c => `${c.red(`${c.bold(client.identityType)} (${client.shortUuid}) disconnected`)} (${clientStore.count} clients) (code: ${code}).`)
    })
  })
}
