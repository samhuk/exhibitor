import { IntercomClient, IntercomIdentityType, IntercomMessage, IntercomMessageType } from './types'

export enum IntercomStatus {
  NOT_CONNECTED,
  CONNECTING,
  CONNECTED
}

type IntercomClientOptions = {
  identityType: IntercomIdentityType
  webSocketCreator: (url: string) => WebSocket
  host: string
  port: number
  events?: {
    onStatusChange?: (newStatus: IntercomStatus, previousStatus: IntercomStatus) => void
    onMessage?: (msg: IntercomMessage) => void
    onReconnect?: (ws: WebSocket) => ({ proceed?: boolean }) | void
  },
}

// eslint-disable-next-line no-promise-executor-return
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const handleMessage = (msg: MessageEvent, options: IntercomClientOptions) => {
  const intercomMessage = JSON.parse(msg.data) as IntercomMessage

  if (intercomMessage == null)
    return

  options.events?.onMessage(intercomMessage)
}

const _connect = (options: IntercomClientOptions, onConnect: (ws: WebSocket) => void) => {
  let ws: WebSocket
  ws = options.webSocketCreator(`ws://${options.host}:${options.port}`)
  ws.onerror = () => {} // onClose function below will handle failed connection logic. This prevents crashes in nodejs envs.
  let onOpen: () => void = null
  let onClose: () => Promise<void> = null
  onOpen = () => {
    ws.removeEventListener('open', onOpen)
    ws.removeEventListener('close', onClose)
    console.log('Connected to intercom.')
    onConnect(ws)
  }
  onClose = async () => {
    ws.removeEventListener('open', onOpen)
    ws.removeEventListener('close', onClose)
    ws.close()
    ws = null
    console.log('Failed to connect to intercom. Trying again in 1s.')
    await wait(1000)
    _connect(options, onConnect)
  }
  ws.addEventListener('open', onOpen)
  ws.addEventListener('close', onClose)
}

const waitUntilConnect = (options: IntercomClientOptions, isReconnect: boolean = false) => new Promise<WebSocket>((res, rej) => {
  console.log(`${isReconnect ? 'Trying to reconnect' : 'Connecting'} to intercom at ${options.host}:${options.port}.`)
  _connect(options, res)
})

export const createIntercomClient = (options: IntercomClientOptions): IntercomClient => {
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

    instance.send({
      to: IntercomIdentityType.SITE_SERVER,
      type: IntercomMessageType.IDENTIFY,
    })

    ws.addEventListener('message', e => handleMessage(e, options))

    ws.addEventListener('close', async () => {
      ws.close()
      updateStatus(IntercomStatus.NOT_CONNECTED)
      console.log('Connection to intercom lost.')

      // Wait a second until we try reconnecting, as it's most likely that this occurs in dev when the server is rebuilt
      await wait(1000)

      updateStatus(IntercomStatus.CONNECTING)
      const _newWs = await waitUntilConnect(options, true) // Wait until reconnection
      const result = options.events?.onReconnect?.(_newWs)
      if (!((result as any)?.proceed ?? true))
        return

      onConnect(_newWs)
      // Send all of the queued messages
      sendQueuedMessages()
    })
  }

  return instance = {
    host: options.host,
    port: options.port,
    status: IntercomStatus.NOT_CONNECTED,
    connect: async () => {
      options.events?.onStatusChange?.(IntercomStatus.CONNECTING, instance.status)
      const newWs = await waitUntilConnect(options)
      onConnect(newWs)
    },
    send: msgOptions => {
      send({ ...msgOptions, from: options.identityType })
    },
  }
}
