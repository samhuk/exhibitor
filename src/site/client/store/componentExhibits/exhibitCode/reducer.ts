import { ThunkAction } from 'redux-thunk'
import { LoadingState, RootState } from '../../types'
import {
  FETCH,
  FETCHED,
  fetchExhibitCode,
  ExhibitCodeActions,
  exhibitCodeFetched,
  ExhibitCodeState,
} from './actions'
import { fetchExhibitCode as fetchExhibitCodeRequest } from '../../../connectors/exhibitCode'
import { SELECT_VARIANT } from '../actions'

const initialState: ExhibitCodeState = {
  doFetch: true,
  loadingState: LoadingState.IDLE,
  exhibitCode: null,
  error: null,
}

export const exhibitCodeReducer = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: ExhibitCodeActions,
): ExhibitCodeState => {
  switch (action.type) {
    case FETCH:
      return {
        ...state,
        doFetch: false,
      }
    case FETCHED:
      return {
        ...state,
        loadingState: action.error != null ? LoadingState.IDLE : LoadingState.FAILED,
        exhibitCode: action.exhibitCode,
        error: action.error,
      }
    case SELECT_VARIANT as any:
      return initialState
    default:
      return state
  }
}

export const fetchExhibitCodeThunk = (exhibitSrcPath: string): ThunkAction<void, RootState, any, ExhibitCodeActions> => dispatch => {
  dispatch(fetchExhibitCode())
  fetchExhibitCodeRequest(exhibitSrcPath).then(response => {
    dispatch(exhibitCodeFetched(response.data, response.error))
  })
}
