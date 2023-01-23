import { ThunkAction } from 'redux-thunk'
import { LoadingState, RootState } from '../types'
import {
  FETCH,
  FETCHED,
  fetchMetaData,
  Actions,
  metaDataFetched,
  MetaDataState,
} from './actions'
import { fetchMetaData as fetchMetaDataRequest } from '../../connectors/metaData'

const initialState: MetaDataState = {
  doFetch: true,
  loadingState: LoadingState.IDLE,
  metaData: null,
  error: null,
}

export const metaDataReducer = (
  // eslint-disable-next-line default-param-last
  state = initialState,
  action: Actions,
): MetaDataState => {
  switch (action.type) {
    case FETCH:
      return {
        ...state,
        doFetch: false,
      }
    case FETCHED: {
      if (action.metaData?.siteTitle != null)
        document.title = action.metaData.siteTitle
      return {
        ...state,
        loadingState: action.error != null ? LoadingState.IDLE : LoadingState.FAILED,
        metaData: action.metaData,
        error: action.error,
      }
    }
    default:
      return state
  }
}

export const fetchMetaDataThunk = (): ThunkAction<void, RootState, any, Actions> => dispatch => {
  dispatch(fetchMetaData())
  fetchMetaDataRequest().then(response => {
    dispatch(metaDataFetched(response))
  })
}
