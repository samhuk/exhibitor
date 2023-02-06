import { IntercomIdentityType } from '../types'
import { IntercomMessage, IntercomMessageOptions } from './types'

export const createIntercomMessage = (
  from: IntercomIdentityType,
  options: IntercomMessageOptions,
): IntercomMessage => ({
  from,
  ...options,
})

export const sendIntercomMessage = (ws: WebSocket, msg: IntercomMessage) => {
  ws.send(JSON.stringify(msg))
}
