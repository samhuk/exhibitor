import { ThunkAction } from 'redux-thunk'
import { AppDispatch, LoadingState, RootState } from '../../types'
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
import { RunPlaywrightTestsOptions } from '../../../../common/testing/playwright'
import { playwrightTestReportService } from '../../../services/playwrightTestReportService'

const initialState: State = {
  loadingState: LoadingState.IDLE,
  results: null,
  dateLastStarted: null,
  dateLastCompleted: null,
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
        dateLastStarted: Date.now(),
        dateLastCompleted: null,
      }
    case RUN_COMPLETE: {
      return {
        ...state,
        loadingState: action.error != null ? LoadingState.IDLE : LoadingState.FAILED,
        results: action.results,
        error: action.error,
        dateLastCompleted: Date.now(),
      }
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

const _runPlaywrightTestsThunk = async (options: RunPlaywrightTestsOptions, dispatch: AppDispatch) => {
  dispatch(run())
  const res = await runPlaywrightTestsRequest(options)
  if (res.data != null) {
    const existingItemForVariantPath = playwrightTestReportService.getByVariantPath(options.variantPath)
    if (existingItemForVariantPath != null)
      playwrightTestReportService.remove(existingItemForVariantPath.id)

    await playwrightTestReportService.add({
      variantPath: res.data.variantPath,
      reportData: res.data.htmlReportData,
    })
  }
  dispatch(runComplete(res))
}

export const runPlaywrightTestsThunk = (options: RunPlaywrightTestsOptions): ThunkAction<void, RootState, any, Actions> => dispatch => {
  _runPlaywrightTestsThunk(options, dispatch)
}
