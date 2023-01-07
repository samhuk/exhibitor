import { LoadingState } from '../../types'

export const FETCH = 'exhibitCode/fetch'

export const FETCHED = 'exhibitCode/fetched'

export type ExhibitCodeState = {
  doFetch: boolean
  loadingState: LoadingState
  exhibitCode: string
  error: any
}

type FetchExhibitCodeAction = {
  type: typeof FETCH
}

type ExhibitCodeFetchedAction = {
  type: typeof FETCHED
  exhibitCode: string
  error: any
}

export type ExhibitCodeActions = FetchExhibitCodeAction | ExhibitCodeFetchedAction

export const fetchExhibitCode = (): ExhibitCodeActions => ({
  type: FETCH,
})

export const exhibitCodeFetched = (exhibitCode: string, error: any): ExhibitCodeActions => ({
  type: FETCHED,
  exhibitCode,
  error,
})
