import { IntercomStatus } from '../../../../common/intercom/client'
import {
  SET_STATUS,
  Actions,
  State,
} from './actions'

const initialState: State = {
  status: IntercomStatus.NOT_CONNECTED,
}

export const intercomReducer = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: Actions,
): State => {
  switch (action.type) {
    case SET_STATUS: {
      return {
        status: action.status,
      }
    }
    default:
      return state
  }
}
