import { BuildStatus } from '../building'
import { IntercomIdentityType, BuiltIntercomIdentity, BuildStatuses } from './types'

export const DEFAULT_INTERCOM_PORT = 38769
export const INTERCOM_PORT_ENV_VAR_NAME = 'EXH_INTERCOM_PORT'

const buildStatuses: BuildStatuses = {
  [IntercomIdentityType.SITE_SERVER]: BuildStatus.NONE,
  [IntercomIdentityType.COMP_LIB_WATCH]: BuildStatus.NONE,
  [IntercomIdentityType.CLIENT_WATCH]: BuildStatus.NONE,
  [IntercomIdentityType.CLI]: BuildStatus.NONE,
}

export const isBuiltIntercomIdentity = (type: IntercomIdentityType): type is BuiltIntercomIdentity => (
  type in buildStatuses
)
