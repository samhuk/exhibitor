import { ConnectionStatus } from 'sock-state/lib/common/connectionStatus'
import { BuildStatus } from '../../../../common/building'
import { BuildStatuses, BuiltExhIdentity } from '../../../../intercom/types'

export const SET_STATUS = 'intercom/setStatus'
export const SET_BUILD_STATUSES = 'intercom/setBuildStatuses'
export const SET_ENABLED = 'intercom/setEnabled'

export type State = {
  enabled: boolean
  connectionStatus: ConnectionStatus
  buildStatuses: { [intercomIdentity in BuiltExhIdentity]: BuildStatus }
}

type SetStatusAction = {
  type: typeof SET_STATUS
  connectionStatus: ConnectionStatus
}

type SetBuildStatusAction = {
  type: typeof SET_BUILD_STATUSES
  buildStatuses: BuildStatuses
}

type SetEnabledAction = {
  type: typeof SET_ENABLED
  enabled: boolean
}

export type Actions = SetStatusAction | SetBuildStatusAction | SetEnabledAction

export const setConnectionStatus = (connectionStatus: ConnectionStatus): Actions => ({
  type: SET_STATUS,
  connectionStatus,
})

export const setBuildStatuses = (buildStatuses: BuildStatuses): Actions => ({
  type: SET_BUILD_STATUSES,
  buildStatuses,
})

export const setEnabled = (enabled: boolean): Actions => ({
  type: SET_ENABLED,
  enabled,
})
