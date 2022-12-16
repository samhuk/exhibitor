import { ThunkAction } from 'redux-thunk'
import { LoadingState, RootState } from '../types'
import {
  FETCH,
  FETCHED,
  fetchMetaData,
  MetaDataActions,
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
  action: MetaDataActions,
): MetaDataState => {
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
        metaData: action.metaData,
        error: action.error,
      }
    default:
      return state
  }
}

export const fetchMetaDataThunk = (): ThunkAction<void, RootState, any, MetaDataActions> => dispatch => {
  dispatch(fetchMetaData())
  fetchMetaDataRequest().then(response => {
    if (response.data?.siteTitle != null)
      document.title = response.data.siteTitle
    dispatch(metaDataFetched(response.data, response.error))
  })
}
