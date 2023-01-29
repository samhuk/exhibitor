import { OmitTyped, TypeDependantBaseIntersection } from '@samhuk/type-helpers'
import { IntercomStatus } from './client'

export enum IntercomIdentityType {
  SITE_CLIENT = 'SITE_CLIENT',
  SITE_SERVER = 'SITE_SERVER',
  CLI = 'CLI',
  COMP_LIB_WATCH = 'COMP_LIB_WATCH',
  CLIENT_WATCH = 'CLIENT_WATCH',
  ANONYMOUS = 'ANONYMOUS'
}

export enum IntercomMessageType {
  COMPONENT_LIBRARY_BUILD_COMPLETED = 'COMPONENT_LIBRARY_BUILD_COMPLETED',
  SITE_CLIENT_BUILD_COMPLETED = 'SITE_CLIENT_BUILD_COMPLETED',
  SITE_SERVER_BUILD_COMPLETED = 'SITE_SERVER_BUILD_COMPLETED',
  IDENTIFY = 'IDENTIFY',
}

export type IntercomMessageOptions = OmitTyped<IntercomMessage, 'from'>

export type IntercomMessage<TType extends IntercomMessageType = IntercomMessageType> = TypeDependantBaseIntersection<
  IntercomMessageType,
  {
    [IntercomMessageType.COMPONENT_LIBRARY_BUILD_COMPLETED]: { },
    [IntercomMessageType.SITE_CLIENT_BUILD_COMPLETED]: { },
    [IntercomMessageType.SITE_SERVER_BUILD_COMPLETED]: { },
    [IntercomMessageType.IDENTIFY]: {},
  },
  TType
> & { from: IntercomIdentityType, to: IntercomIdentityType }

export type IntercomClient = {
  host: string
  port: number
  status: IntercomStatus
  connect: () => Promise<void>
  send: (msg: IntercomMessageOptions) => void
}

export type IntercomClientOptions = {
  identityType: IntercomIdentityType
  webSocketCreator: (url: string) => WebSocket
  host: string
  port: number
  enableLogging: boolean
  events?: {
    onStatusChange?: (newStatus: IntercomStatus, previousStatus: IntercomStatus) => void
    onMessage?: (msg: IntercomMessage) => void
    onReconnect?: (ws: WebSocket) => ({ proceed?: boolean }) | void
  },
}

export type IntercomClientOptionsInternal = IntercomClientOptions & {
  log: (s: string) => void
}
