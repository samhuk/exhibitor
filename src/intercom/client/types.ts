import { RawData } from 'ws'
import { IntercomConnectionStatus } from '.'
import { IntercomMessageOptions, IntercomMessage } from '../message/types'
import { IntercomIdentityType } from '../types'

export type IntercomClient = {
  host: string
  port: number
  status: IntercomConnectionStatus
  connect: () => Promise<void>
  disconnect: () => void
  send: (msg: IntercomMessageOptions) => void
}

export type IntercomClientOptions = {
  identityType: IntercomIdentityType
  webSocket: ExhWebSocket
  host: string
  port: number
  enableLogging: boolean
  /**
   * @default true
   */
  queueMsgOnDropout?: boolean
  events?: {
    onStatusChange?: (newStatus: IntercomConnectionStatus, previousStatus: IntercomConnectionStatus) => void
    onMessage?: (msg: IntercomMessage) => void
    onReconnect?: (ws: WebSocket) => ({ proceed?: boolean }) | void
  },
}

export type IntercomClientOptionsInternal = IntercomClientOptions & {
  log: (s: string) => void
}

export type ExhWebSocket = {
  create: (url: string) => WebSocket
  recieve: (msg: MessageEvent | RawData) => IntercomMessage
}
