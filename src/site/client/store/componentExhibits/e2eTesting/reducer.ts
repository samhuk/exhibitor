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
  // doFetch: true,
  loadingState: LoadingState.IDLE,
  // eslint-disable-next-line max-len
  results: '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',
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
