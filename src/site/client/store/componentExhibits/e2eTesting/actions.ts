import { LoadingState } from '../../types'

export const RUN = 'e2eTesting/run'

export const RUN_COMPLETE = 'e2eTesting/runComplete'

export type State = {
  // doFetch: boolean
  loadingState: LoadingState
  results: any
  error: any
}

type RunAction = {
  type: typeof RUN
}

type RunCompleteAction = {
  type: typeof RUN_COMPLETE
  results: any
  error: any
}

export type Actions = RunAction | RunCompleteAction

export const Run = (): Actions => ({
  type: RUN,
})

export const RunComplete = (results: any, error: any): Actions => ({
  type: RUN_COMPLETE,
  results,
  error,
})
