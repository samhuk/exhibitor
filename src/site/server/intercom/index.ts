import WebSocket, { WebSocketServer } from 'ws'
import { randomUUID } from 'crypto'
import { IntercomIdentityType, IntercomMessage } from '../../../common/intercom/types'
import { logIntercomInfo } from '../../../common/logging'

const PREFERRED_PORT = 8000

export const initIntercom = () => {
  logIntercomInfo('Creating Intercom server')
  const wss = new WebSocketServer({ port: PREFERRED_PORT })

  const clients: { [uuid: string]: { ws: WebSocket } } = {}

  const broadcastMessage = (msg: IntercomMessage) => {
    Object.values(clients).forEach(client => {
      client.ws.send(JSON.stringify(msg))
    })
  }

  wss.on('connection', ws => {
    const uuid = randomUUID()
    clients[uuid] = { ws }
    logIntercomInfo(c => `${c.green('Client connected')} to Intercom (${Object.keys(clients).length} clients).`)

    ws.on('message', data => {
      const dataStr = String(data)
      logIntercomInfo(c => `Intercom recieved message. Message: ${c.cyan(dataStr)}`)
      const msg = JSON.parse(dataStr) as IntercomMessage
      if (msg.to !== IntercomIdentityType.SITE_SERVER)
        broadcastMessage(msg)
    })

    ws.on('close', (code, reason) => {
      delete clients[uuid]
      logIntercomInfo(c => `${c.red('Client disconnected')} from Intercom (${Object.keys(clients).length} clients) (code: ${code}).`)
    })
  })
}
