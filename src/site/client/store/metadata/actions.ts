import { LoadingState } from '../types'
import { MetaData } from '../../../../common/metadata'

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

export type MetaDataActions = FetchMetaDataAction | MetaDataFetchedAction

export const fetchMetaData = (): MetaDataActions => ({
  type: FETCH,
})

export const metaDataFetched = (metaData: MetaData, error: any): MetaDataActions => ({
  type: FETCHED,
  metaData,
  error,
})
