import { LoadingState } from '../types'
import { MetaData } from '../../../../common/metadata'
import { ExhResponse } from '../../../common/responses'
import { normalizeExhResponse } from '../../misc'

export const FETCH = 'metaData/fetch'

export const FETCHED = 'metaData/fetched'

export type MetaDataState = {
  doFetch: boolean
  loadingState: LoadingState
  metaData: MetaData
  error: any
}

type FetchMetaDataAction = {
  type: typeof FETCH
}

type MetaDataFetchedAction = {
  type: typeof FETCHED
  metaData: MetaData
  error: any
}

export type Actions = FetchMetaDataAction | MetaDataFetchedAction

export const fetchMetaData = (): Actions => ({
  type: FETCH,
})

export const metaDataFetched = (response: ExhResponse<MetaData>): Actions => {
  const res = normalizeExhResponse(response)
  return {
    type: FETCHED,
    metaData: res.data,
    error: res.error,
  }
}
