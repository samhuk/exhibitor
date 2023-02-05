import WebSocket, { WebSocketServer } from 'ws'
import { DEFAULT_INTERCOM_PORT, INTERCOM_PORT_ENV_VAR_NAME, isBuiltIntercomIdentity } from '..'
import { logIntercomInfo } from '../../common/logging'
import { IntercomMessage, IntercomMessageType } from '../message/types'
import { BuildStatusService, IntercomIdentityType } from '../types'
import { createClientStore } from './clientStore'

export const createInteromServer = (buildStatusService: BuildStatusService) => {
  const host = process.env.EXH_SITE_SERVER_HOST ?? 'localhost'
  const port = process.env[INTERCOM_PORT_ENV_VAR_NAME] != null ? parseInt(process.env[INTERCOM_PORT_ENV_VAR_NAME]) : DEFAULT_INTERCOM_PORT
  logIntercomInfo(c => `Creating Intercom server on ${c.cyan(`${host}:${port}`)}`)
  const wss = new WebSocketServer({ host, port })

  const clientStore = createClientStore()

  const broadcastMessage = (msg: IntercomMessage) => {
    // Send the message to all clients of the identity type of the message's "to" property.
    clientStore.getClientList(msg.to).forEach(client => {
      if (client.ws.readyState !== WebSocket.OPEN)
        return
      logIntercomInfo(c => `Relaying msg to ${c.bold(msg.to)} (${client.shortUuid}).`)
      client.ws.send(JSON.stringify(msg))
    })
  }

  wss.on('connection', ws => {
    const client = clientStore.add({ ws })

    logIntercomInfo(c => `${c.green('Client connected')} (${client.shortUuid}) (${clientStore.count} clients).`)

    ws.on('message', data => {
      const dataStr = String(data)
      const msg = JSON.parse(dataStr) as IntercomMessage

      if (msg.type !== IntercomMessageType.IDENTIFY)
        logIntercomInfo(c => `Recieved message from ${c.bold(client.identityType)} (${client.shortUuid}). Message: ${c.cyan(dataStr)}`)

      if (client.identityType === IntercomIdentityType.ANONYMOUS) {
        // This should never happen
        if (msg.from == null) {
          logIntercomInfo(c => `Anonymous message from ${client.shortUuid} had no 'from' property. Who is this? We will ignore this message. Message: ${c.cyan(dataStr)}`)
          return
        }
        // Store and log the identification of the client
        clientStore.identify(client.uuid, msg.from)
        logIntercomInfo(c => `Identified client ${client.shortUuid} as ${c.bold(msg.from)}`)
      }

      if (msg.type === IntercomMessageType.IDENTIFY) {
        // When a site client connects to intercom, notify them of the current build statuses
        if (msg.from === IntercomIdentityType.SITE_CLIENT) {
          const buildStatusNoticeMsg: IntercomMessage = {
            type: IntercomMessageType.BUILD_STATUSES_NOTICE,
            from: IntercomIdentityType.SITE_SERVER,
            statuses: buildStatusService.statuses,
          }
          ws.send(JSON.stringify(buildStatusNoticeMsg))
        }
      }

      // If an identity tells us that it's build status changed, update our store of it and send update to site clients.
      if (msg.type === IntercomMessageType.BUILD_STATUS_CHANGE && isBuiltIntercomIdentity(msg.from)) {
        const prevStatuses = { ...buildStatusService.statuses }
        buildStatusService.update(msg.from, msg.status)
        broadcastMessage({
          from: IntercomIdentityType.SITE_SERVER,
          to: IntercomIdentityType.SITE_CLIENT,
          type: IntercomMessageType.BUILD_STATUSES_CHANGE,
          prevStatuses,
          statuses: buildStatusService.statuses,
        })
        return
      }

      broadcastMessage(msg)
    })

    ws.on('close', code => {
      clientStore.remove(client.uuid)
      logIntercomInfo(c => `${c.red(`${c.bold(client.identityType)} (${client.shortUuid}) disconnected`)} (${clientStore.count} clients) (code: ${code}).`)
    })
  })
}
