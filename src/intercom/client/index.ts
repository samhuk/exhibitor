import { wait } from '../../common/function'
import { createIntercomMessage } from '../message'
import { IntercomMessage, IntercomMessageType } from '../message/types'
import {
  IntercomIdentityType,
} from '../types'
import { IntercomClientOptions, IntercomClientOptionsInternal, IntercomClient } from './types'

export enum IntercomConnectionStatus {
  NOT_CONNECTED = 'NOT_CONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED'
}

const handleMessage = (msg: MessageEvent, options: IntercomClientOptions) => {
  const intercomMessage = options.webSocket.recieve(msg)

  if (intercomMessage == null)
    return

  options.events?.onMessage?.(intercomMessage)
}

const _connect = (options: IntercomClientOptionsInternal, onConnect: (ws: WebSocket) => void) => {
  let ws: WebSocket
  ws = options.webSocket.create(`ws://${options.host}:${options.port}`)
  ws.onerror = () => {} // onClose function below will handle failed connection logic. This prevents crashes in nodejs envs.
  let onOpen: () => void = null
  let onClose: () => Promise<void> = null
  onOpen = () => {
    ws.removeEventListener('open', onOpen)
    ws.removeEventListener('close', onClose)
    options.log('Connected to intercom.')
    onConnect(ws)
  }
  onClose = async () => {
    ws.removeEventListener('open', onOpen)
    ws.removeEventListener('close', onClose)
    ws.close()
    ws = null
    options.log('Failed to connect to intercom. Trying again in 1s.')
    await wait(500)
    _connect(options, onConnect)
  }
  ws.addEventListener('open', onOpen)
  ws.addEventListener('close', onClose)
}

const waitUntilConnect = (options: IntercomClientOptionsInternal, isReconnect: boolean = false) => new Promise<WebSocket>(res => {
  options.log(`${isReconnect ? 'Trying to reconnect' : 'Connecting'} to intercom at ${options.host}:${options.port}.`)
  _connect(options, res)
})

export const createIntercomClient = (options: IntercomClientOptions): IntercomClient => {
  const log: (s: string) => void = options.enableLogging ? (s: string) => console.log(s) : () => {}

  const internalOptions: IntercomClientOptionsInternal = {
    ...options,
    queueMsgOnDropout: options.queueMsgOnDropout ?? true,
    log,
  }

  let instance: IntercomClient
  let ws: WebSocket
  const queuedMessages: IntercomMessage[] = []
  let beenToldToDisconnect = false

  const identifyOurself = () => {
    instance.send({
      to: IntercomIdentityType.SITE_SERVER,
      type: IntercomMessageType.IDENTIFY,
    })
  }

  const send = (msg: IntercomMessage) => {
    if (instance.status !== IntercomConnectionStatus.CONNECTED && internalOptions.queueMsgOnDropout)
      queuedMessages.push(msg)
    else
      ws.send(JSON.stringify(msg))
  }

  const sendQueuedMessages = () => {
    while (queuedMessages.length > 0) {
      // If the websocket dies while we are sending messages then stop sending queued messages
      if (ws.readyState !== ws.OPEN)
        return

      send(queuedMessages.shift())
    }
  }

  const updateStatus = (newStatus: IntercomConnectionStatus) => {
    internalOptions.events?.onStatusChange?.(newStatus, instance.status)
    instance.status = newStatus
  }

  const onConnect = (newWs: WebSocket) => {
    ws = newWs
    updateStatus(IntercomConnectionStatus.CONNECTED)
    identifyOurself()

    ws.addEventListener('message', e => handleMessage(e, internalOptions))

    ws.addEventListener('close', async () => {
      if (beenToldToDisconnect)
        return
      ws.close()
      updateStatus(IntercomConnectionStatus.NOT_CONNECTED)
      log('Connection to intercom lost.')

      updateStatus(IntercomConnectionStatus.CONNECTING)
      const _newWs = await waitUntilConnect(internalOptions, true) // Wait until reconnection
      updateStatus(IntercomConnectionStatus.CONNECTED)
      const result = internalOptions.events?.onReconnect?.(_newWs)
      if (!((result as any)?.proceed ?? true))
        return

      onConnect(_newWs)
      if (internalOptions.queueMsgOnDropout) {
        // Send all of the queued messages
        sendQueuedMessages()
      }
    })
  }

  return instance = {
    host: internalOptions.host,
    port: internalOptions.port,
    status: IntercomConnectionStatus.NOT_CONNECTED,
    connect: async () => {
      updateStatus(IntercomConnectionStatus.CONNECTING)
      const newWs = await waitUntilConnect(internalOptions)
      onConnect(newWs)
    },
    send: msgOptions => {
      send(createIntercomMessage(internalOptions.identityType, msgOptions))
    },
    disconnect: () => {
      beenToldToDisconnect = true
      ws.close()
    },
  }
}
