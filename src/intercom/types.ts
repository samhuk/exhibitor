import { BuildStatus } from '../common/building'

export enum BuiltExhIdentity {
  COMP_LIB = 'COMP_LIB',
  SITE_CLIENT = 'SITE_CLIENT',
  SITE_SERVER = 'SITE_SERVER',
}

export type BuildStatuses = { [identity in BuiltExhIdentity]: BuildStatus }

export type UpdateBuildStatusAction = {
  type: 'updateStatus'
  payload: {
    identity: BuiltExhIdentity,
    status: BuildStatus
  }
}

export type BuildStatusesActions = UpdateBuildStatusAction
