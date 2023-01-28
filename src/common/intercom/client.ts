import { IntercomIdentityType, IntercomMessage, IntercomMessageOptions } from './types'

export enum IntercomStatus {
  NOT_CONNECTED,
  CONNECTING,
  CONNECTED
}

type IntercomClientOptions = {
  identityType: IntercomIdentityType
  webSocketCreator: (url: string) => WebSocket
  events?: {
    onStatusChange?: (newStatus: IntercomStatus, previousStatus: IntercomStatus) => void
    onMessage?: (msg: IntercomMessage) => void
    onReconnect?: (ws: WebSocket) => void
  },
}

type IntercomClient = {
  status: IntercomStatus
  connect: () => Promise<void>
  send: (msg: IntercomMessageOptions) => void
}

const handleMessage = (msg: MessageEvent, options: IntercomClientOptions) => {
  const intercomMessage = JSON.parse(msg.data) as IntercomMessage

  if (intercomMessage == null)
    return

  options.events?.onMessage(intercomMessage)
}

const _connect = (webSocketCreator: (url: string) => WebSocket, onConnect: (ws: WebSocket) => void) => {
  let ws: WebSocket
  ws = webSocketCreator('ws://localhost:8000')
  ws.onerror = () => {} // onClose function below will handle failed connection logic. This prevents crashes in nodejs envs.
  let onOpen: () => void = null
  let onClose: () => void = null
  onOpen = () => {
    ws.removeEventListener('open', onOpen)
    ws.removeEventListener('close', onClose)
    console.log('Connected to intercom.')
    onConnect(ws)
  }
  onClose = () => {
    ws.removeEventListener('open', onOpen)
    ws.removeEventListener('close', onClose)
    ws.close()
    ws = null
    console.log('Failed to connect to intercom. Trying again...')
    setTimeout(() => {
      console.log('Attempting to connect to intercom...')
      _connect(webSocketCreator, onConnect)
    }, 1000)
  }
  ws.addEventListener('open', onOpen)
  ws.addEventListener('close', onClose)
}

const waitUntilConnect = (webSocketCreator: (url: string) => WebSocket, isReconnect: boolean = false) => new Promise<WebSocket>((res, rej) => {
  console.log(`Attempting to ${isReconnect ? 're' : ''}connect to intercom...`)
  _connect(webSocketCreator, res)
})

export const createIntercomClient = (options: IntercomClientOptions) => {
  let instance: IntercomClient
  let ws: WebSocket
  const queuedMessages: IntercomMessage[] = []

  const send = (msg: IntercomMessage) => {
    if (instance.status !== IntercomStatus.CONNECTED)
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

  const updateStatus = (newStatus: IntercomStatus) => {
    options.events?.onStatusChange?.(newStatus, instance.status)
    instance.status = newStatus
  }

  const onConnect = (newWs: WebSocket) => {
    ws = newWs
    updateStatus(IntercomStatus.CONNECTED)

    ws.addEventListener('message', e => handleMessage(e, options))

    ws.addEventListener('close', async () => {
      ws.close()
      updateStatus(IntercomStatus.NOT_CONNECTED)
      console.log('Connection to intercom lost.')
      updateStatus(IntercomStatus.CONNECTING)
      const _newWs = await waitUntilConnect(options.webSocketCreator, true) // Wait until reconnection
      options.events?.onReconnect?.(_newWs)
      onConnect(_newWs)
      // Send all of the queued messages
      sendQueuedMessages()
    })
  }

  return instance = {
    status: IntercomStatus.NOT_CONNECTED,
    connect: async () => {
      options.events?.onStatusChange?.(IntercomStatus.CONNECTING, instance.status)
      const newWs = await waitUntilConnect(options.webSocketCreator)
      onConnect(newWs)
    },
    send: msgOptions => {
      send({ ...msgOptions, from: options.identityType })
    },
  }
}
