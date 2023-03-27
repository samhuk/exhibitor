import { SerializedGFError } from 'good-flow/lib/serialized'
import { LoadingState } from '../types'
import { MetaData } from '../../../../common/metadata'
import { ExhResponse } from '../../../common/responses'

export const FETCH = 'metaData/fetch'

export const FETCHED = 'metaData/fetched'

export type MetaDataState = {
  doFetch: boolean
  loadingState: LoadingState
  metaData: MetaData
  error: SerializedGFError
}

type FetchMetaDataAction = {
  type: typeof FETCH
}

type MetaDataFetchedAction = {
  type: typeof FETCHED
  metaData: MetaData
  error: SerializedGFError
}

export type Actions = FetchMetaDataAction | MetaDataFetchedAction

export const fetchMetaData = (): Actions => ({
  type: FETCH,
})

export const metaDataFetched = (res: ExhResponse<MetaData>): Actions => ({
  type: FETCHED,
  metaData: res.data,
  error: res.error,
})
