import { OmitTyped } from '@samhuk/type-helpers'
import WebSocket, { RawData } from 'ws'
import { createIntercomClient } from '.'
import { IntercomMessage } from '../message/types'
import { ExhWebSocket, IntercomClientOptions } from './types'

export const nodeWebSocket: ExhWebSocket = {
  create: (url: string) => new WebSocket(url) as any,
  recieve: (msg: MessageEvent | RawData) => {
    const _msg = msg as RawData
    return JSON.parse(String(_msg)) as IntercomMessage
  },
}

export const createNodeIntercomClient = (
  options: OmitTyped<IntercomClientOptions, 'webSocket'>,
) => createIntercomClient({
  webSocket: nodeWebSocket,
  ...options,
})
