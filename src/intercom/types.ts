import { TypeDependantBaseIntersection } from '@samhuk/type-helpers'
import { BuildStatus } from '../common/building'

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
