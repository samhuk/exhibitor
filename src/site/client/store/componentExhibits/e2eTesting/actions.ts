import { PlaywrightTestResults } from '../../../../common/e2eTesting'
import { LoadingState } from '../../types'

export const RUN = 'e2eTesting/run'

export const RUN_COMPLETE = 'e2eTesting/runComplete'

export type State = {
  // doFetch: boolean
  loadingState: LoadingState
  results: PlaywrightTestResults
  error: any
}

type RunAction = {
  type: typeof RUN
}

type RunCompleteAction = {
  type: typeof RUN_COMPLETE
  results: PlaywrightTestResults
  error: any
}

export type Actions = RunAction | RunCompleteAction

export const Run = (): Actions => ({
  type: RUN,
})

export const RunComplete = (results: PlaywrightTestResults, error: any): Actions => ({
  type: RUN_COMPLETE,
  results,
  error,
})
