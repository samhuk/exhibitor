import { BuildStatus } from '../../../../common/building'
import { IntercomConnectionStatus } from '../../../../common/intercom/client'
import { BuildStatuses, BuiltIntercomIdentity } from '../../../../common/intercom/types'

export const SET_STATUS = 'intercom/setStatus'

export const SET_BUILD_STATUSES = 'intercom/setBuildStatuses'

export type State = {
  connectionStatus: IntercomConnectionStatus
  buildStatuses: { [intercomIdentity in BuiltIntercomIdentity]: BuildStatus }
}

type SetStatusAction = {
  type: typeof SET_STATUS
  connectionStatus: IntercomConnectionStatus
}

type SetBuildStatusAction = {
  type: typeof SET_BUILD_STATUSES
  buildStatuses: BuildStatuses
}

export type Actions = SetStatusAction | SetBuildStatusAction

export const setConnectionStatus = (connectionStatus: IntercomConnectionStatus): Actions => ({
  type: SET_STATUS,
  connectionStatus,
})

export const setBuildStatuses = (buildStatuses: BuildStatuses): Actions => ({
  type: SET_BUILD_STATUSES,
  buildStatuses,
})
