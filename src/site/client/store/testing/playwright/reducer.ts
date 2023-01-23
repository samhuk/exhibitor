import { ThunkAction } from 'redux-thunk'
import { LoadingState, RootState } from '../../types'
import {
  RUN,
  RUN_COMPLETE,
  State,
  Actions,
  run,
  runComplete,
  TOGGLE_HEADLESS,
} from './actions'
import { runPlaywrightTests as runPlaywrightTestsRequest } from '../../../connectors/testing'
import { SELECT_VARIANT } from '../../componentExhibits/actions'
import { RunE2eTestOptions } from '../../../../common/e2eTesting'

const initialState: State = {
  loadingState: LoadingState.IDLE,
  results: null,
  options: {
    headless: true,
  },
  error: null,
}

export const playwrightReducer = (
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
    case TOGGLE_HEADLESS:
      return {
        ...state,
        options: {
          ...state.options,
          headless: !state.options.headless,
        },
      }
    case SELECT_VARIANT as any:
      return initialState
    default:
      return state
  }
}

export const runPlaywrightTestsThunk = (options: RunE2eTestOptions): ThunkAction<void, RootState, any, Actions> => dispatch => {
  dispatch(run())
  runPlaywrightTestsRequest(options).then(response => {
    dispatch(runComplete(response))
  })
}
