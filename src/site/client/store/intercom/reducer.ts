import { BuildStatus } from '../../../../common/building'
import { IntercomConnectionStatus } from '../../../../common/intercom/client'
import { IntercomIdentityType } from '../../../../common/intercom/types'
import {
  SET_STATUS,
  Actions,
  State,
  SET_BUILD_STATUSES,
} from './actions'

const initialState: State = {
  connectionStatus: IntercomConnectionStatus.NOT_CONNECTED,
  buildStatuses: {
    [IntercomIdentityType.SITE_SERVER]: BuildStatus.NONE,
    [IntercomIdentityType.COMP_LIB_WATCH]: BuildStatus.NONE,
    [IntercomIdentityType.CLIENT_WATCH]: BuildStatus.NONE,
    [IntercomIdentityType.CLI]: BuildStatus.NONE,
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
    default:
      return state
  }
}
