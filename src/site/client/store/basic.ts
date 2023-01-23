import { ThunkAction } from 'redux-thunk'
import { ExhResponse } from '../../common/responses'
import { isSerializedExhError, normalizeExhResponse } from '../misc'
import { LoadingState } from './types'

export type State<TValue extends any = any> = {
  value: TValue
  loadingState: LoadingState
  fetched: boolean
  error: any
}

type FetchAction<TType extends string = string> = {
  type: TType
}

type FetchedAction<
  TType extends string = string,
  TValue extends any = any,
> = {
  type: TType
  value: TValue
  error: any
}

type BasicStoreSegmentArtifacts<
  TValue extends any,
  TFetchRequestFn extends (...args: any[]) => Promise<ExhResponse<TValue>> = (...args: any[]) => Promise<ExhResponse<TValue>>,
> = {
  fetchThunk: (...args: Parameters<TFetchRequestFn>) => ThunkAction<void, any, any, any>
  reducer: (state: State<TValue>, action: any) => State<TValue>,
}

export const createBasicStoreSegmentArtifacts = <
  TActionSegmentName extends string,
  TValue extends any,
  TFetchRequestFn extends (...args: any[]) => Promise<ExhResponse<TValue>>,
>(
    segmentActionName: TActionSegmentName,
    fetchRequestFn: TFetchRequestFn,
    defaultValue: TValue,
  ): BasicStoreSegmentArtifacts<TValue, TFetchRequestFn> => {
  const initialState: State<TValue> = {
    error: null,
    loadingState: LoadingState.IDLE,
    value: defaultValue,
    fetched: false,
  }

  const FETCH = `FETCH_${segmentActionName}`

  const FETCHED = `${segmentActionName}_FETCHED`

  const fetchAction = (): FetchAction<typeof FETCH> => ({
    type: FETCH,
  })

  const fetchedAction = (response: ExhResponse<TValue>): FetchedAction<typeof FETCHED, TValue> => {
    const res = normalizeExhResponse(response)
    return {
      type: FETCHED,
      value: res.data,
      error: res.error,
    }
  }

  const fetchThunk = (...args: any[]): ThunkAction<void, any, any, any> => dispatch => {
    // Start the fetching state
    dispatch(fetchAction())
    fetchRequestFn(...args).then(response => {
      dispatch(fetchedAction(response))
    })
  }

  const reducer = (
    // eslint-disable-next-line default-param-last
    state = initialState,
    action: any,
  ): State<TValue> => {
    switch (action.type) {
      case FETCH:
        return {
          ...state,
          loadingState: LoadingState.FETCHING,
        }
      case FETCHED:
        return {
          value: action.value,
          error: action.error,
          loadingState: action.error == null ? LoadingState.IDLE : LoadingState.FAILED,
          fetched: true,
        }
      default:
        return state
    }
  }

  return {
    fetchThunk,
    reducer,
  }
}
