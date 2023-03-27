import { SerializedGFError } from 'good-flow/lib/serialized'
import { ExhResponse } from '../../../../common/responses'
import { LoadingState } from '../../types'

export const FETCH = 'exhibitCode/fetch'

export const FETCHED = 'exhibitCode/fetched'

export type ExhibitCodeState = {
  doFetch: boolean
  loadingState: LoadingState
  exhibitCode: string
  error: SerializedGFError
}

type FetchExhibitCodeAction = {
  type: typeof FETCH
}

type ExhibitCodeFetchedAction = {
  type: typeof FETCHED
  exhibitCode: string
  error: any
}

export type Actions = FetchExhibitCodeAction | ExhibitCodeFetchedAction

export const fetchExhibitCode = (): Actions => ({
  type: FETCH,
})

export const exhibitCodeFetched = (res: ExhResponse<string>): Actions => ({
  type: FETCHED,
  exhibitCode: res.data,
  error: res.error,
})
