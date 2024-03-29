import { ConnectionStatus } from 'sock-state/lib/common/connectionStatus'
import { BuildStatus } from '../../../../common/building'
import { BuiltExhIdentity } from '../../../../intercom/types'
import {
  SET_STATUS,
  Actions,
  State,
  SET_BUILD_STATUSES,
  SET_ENABLED,
} from './actions'

const initialState: State = {
  enabled: false,
  connectionStatus: ConnectionStatus.DISCONNECTED,
  buildStatuses: {
    [BuiltExhIdentity.SITE_SERVER]: BuildStatus.NONE,
    [BuiltExhIdentity.SITE_CLIENT]: BuildStatus.NONE,
    [BuiltExhIdentity.COMP_LIB]: BuildStatus.NONE,
  },
}

export const intercomReducer = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: Actions,
): State => {
  switch (action.type) {
    case SET_STATUS: {
      return {
        ...state,
        connectionStatus: action.connectionStatus,
      }
    }
    case SET_BUILD_STATUSES: {
      return {
        ...state,
        buildStatuses: action.buildStatuses,
      }
    }
    case SET_ENABLED: {
      return {
        ...state,
        enabled: true,
      }
    }
    default:
      return state
  }
}
