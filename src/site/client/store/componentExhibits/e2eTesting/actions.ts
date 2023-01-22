import { PlaywrightTestResults } from '../../../../common/e2eTesting'
import { LoadingState } from '../../types'

export const RUN = 'e2eTesting/run'

export const RUN_COMPLETE = 'e2eTesting/runComplete'

export const TOGGLE_HEADLESS = 'e2eTesting/toggleHeadless'

export type Options = {
  headless: boolean
}

export type State = {
  loadingState: LoadingState
  results: PlaywrightTestResults
  options: Options
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

type ToggleHeadlessAction = {
  type: typeof TOGGLE_HEADLESS
}

export type Actions = RunAction | RunCompleteAction | ToggleHeadlessAction

export const run = (): Actions => ({
  type: RUN,
})

export const runComplete = (results: PlaywrightTestResults, error: any): Actions => ({
  type: RUN_COMPLETE,
  results,
  error,
})

export const toggleHeadless = (): Actions => ({
  type: TOGGLE_HEADLESS,
})
