import { TypeDependantBaseIntersection } from '@samhuk/type-helpers'
import { BuildStatus } from '../building'
import { IntercomConnectionStatus } from './client'

export enum IntercomIdentityType {
  SITE_CLIENT = 'SITE_CLIENT',
  SITE_SERVER = 'SITE_SERVER',
  CLI = 'CLI',
  COMP_LIB_WATCH = 'COMP_LIB_WATCH',
  CLIENT_WATCH = 'CLIENT_WATCH',
  ANONYMOUS = 'ANONYMOUS'
}

export type BuiltIntercomIdentity = IntercomIdentityType.CLI
  | IntercomIdentityType.CLIENT_WATCH
  | IntercomIdentityType.COMP_LIB_WATCH
  | IntercomIdentityType.SITE_SERVER

export type BuildStatuses = { [identityType in BuiltIntercomIdentity]: BuildStatus }

export type BuildStatusService = {
  statuses: BuildStatuses
  allSuccessful: boolean
  update: (intercomIdentity: BuiltIntercomIdentity, newStatus: BuildStatus) => void
  getUnsuccessfulBuilds: () => { identityType: BuiltIntercomIdentity, status: Exclude<BuildStatus, BuildStatus.SUCCESS> }[]
  waitUntilNextAllSuccessful: () => Promise<void>
}

export enum IntercomMessageType {
  BUILD_STATUS_CHANGE = 'BUILD_STATUS_CHANGE',
  BUILD_STATUSES_NOTICE = 'BUILD_STATUSES_NOTICE',
  BUILD_STATUSES_CHANGE = 'BUILD_STATUSES_CHANGE',
  IDENTIFY = 'IDENTIFY',
}

export type IntercomMessageOptions<
  TType extends IntercomMessageType = IntercomMessageType,
  > = TypeDependantBaseIntersection<
  IntercomMessageType,
  {
    [IntercomMessageType.BUILD_STATUSES_NOTICE]: {
      statuses: BuildStatuses
    }
    [IntercomMessageType.BUILD_STATUS_CHANGE]: {
      prevStatus: BuildStatus
      status: BuildStatus
    }
    [IntercomMessageType.IDENTIFY]: { }
    [IntercomMessageType.BUILD_STATUSES_CHANGE]: {
      prevStatuses: BuildStatuses
      statuses: BuildStatuses
    }
  },
  TType
> & { to?: IntercomIdentityType }

export type IntercomMessage<
  TType extends IntercomMessageType = IntercomMessageType,
> = IntercomMessageOptions<TType> & { from: IntercomIdentityType }

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
  webSocketCreator: (url: string) => WebSocket
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
