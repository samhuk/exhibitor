import { ThunkAction } from 'redux-thunk'
import { LoadingState, RootState } from '../../types'
import {
  RUN,
  RUN_COMPLETE,
  State,
  Actions,
  Run,
  RunComplete,
} from './actions'
import { runE2eTest as runE2eTestRequest } from '../../../connectors/e2eTesting'
import { SELECT_VARIANT } from '../actions'
import { RunE2eTestOptions } from '../../../../common/e2eTesting'

const initialState: State = {
  loadingState: LoadingState.IDLE,
  results: null,
  error: null,
}

export const e2eTestingReducer = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: Actions,
): State => {
  switch (action.type) {
    case RUN:
      return {
        ...state,
        loadingState: LoadingState.FETCHING,
      }
    case RUN_COMPLETE:
      return {
        ...state,
        loadingState: action.error != null ? LoadingState.IDLE : LoadingState.FAILED,
        results: action.results,
        error: action.error,
      }
    case SELECT_VARIANT as any:
      return initialState
    default:
      return state
  }
}

export const runE2eTestThunk = (options: RunE2eTestOptions): ThunkAction<void, RootState, any, Actions> => dispatch => {
  dispatch(Run())
  runE2eTestRequest(options).then(response => {
    dispatch(RunComplete(response.data, response.error))
  })
}
