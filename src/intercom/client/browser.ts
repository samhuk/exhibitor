import { OmitTyped } from '@samhuk/type-helpers'
import { RawData } from 'ws'
import { createIntercomClient } from '.'
import { IntercomMessage } from '../message/types'
import { ExhWebSocket, IntercomClientOptions } from './types'

export const browserWebSocket: ExhWebSocket = {
  create: (url: string) => new WebSocket(url),
  recieve: (msg: MessageEvent | RawData) => {
    const _msg = msg as MessageEvent
    return JSON.parse(_msg.data) as IntercomMessage
  },
}

export const createBrowserIntercomClient = (
  options: OmitTyped<IntercomClientOptions, 'webSocket'>,
) => createIntercomClient({
  webSocket: browserWebSocket,
  ...options,
})
