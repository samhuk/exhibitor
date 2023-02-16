import { Reducer } from 'sock-state'
import { BuildStatus } from '../common/building'
import { BuildStatuses, BuildStatusesActions, BuiltExhIdentity } from './types'

export const DEFAULT_INTERCOM_PORT = 38769
export const INTERCOM_PORT_ENV_VAR_NAME = 'EXH_INTERCOM_PORT'

export const BUILD_STATUSES_TOPIC = 'buildStatuses'

export const INITIAL_STATE: BuildStatuses = {
  [BuiltExhIdentity.SITE_SERVER]: BuildStatus.NONE,
  [BuiltExhIdentity.COMP_LIB]: BuildStatus.NONE,
  [BuiltExhIdentity.SITE_CLIENT]: BuildStatus.NONE,
}

export const createBuildStatusesReducer = (initialState?: BuildStatuses): Reducer<BuildStatuses, BuildStatusesActions> => (state, action) => {
  if (state == null)
    return initialState ?? INITIAL_STATE

  switch (action.type) {
    case 'updateStatus':
      return {
        ...state,
        [action.payload.identity]: action.payload.status,
      }
    default:
      return state
  }
}

export const updateBuildStatus = (identity: BuiltExhIdentity, status: BuildStatus): BuildStatusesActions => ({
  type: 'updateStatus',
  payload: { identity, status },
})

export const areAllBuildStatusesSuccessful = (statuses: BuildStatuses) => !Object.values(statuses).some(s => s !== BuildStatus.SUCCESS)
