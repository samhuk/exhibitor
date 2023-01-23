import { SerializedExhError } from '../../../../../common/exhError/serialization/types'
import { PlaywrightTestResults } from '../../../../common/e2eTesting'
import { ExhResponse } from '../../../../common/responses'
import { normalizeExhResponse } from '../../../misc'
import { LoadingState } from '../../types'

export const RUN = 'testing/playwright/run'

export const RUN_COMPLETE = 'testing/playwright/runComplete'

export const TOGGLE_HEADLESS = 'testing/playwright/toggleHeadless'

export type Options = {
  headless: boolean
}

export type State = {
  loadingState: LoadingState
  results: PlaywrightTestResults
  options: Options
  error: SerializedExhError
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

export const runComplete = (response: ExhResponse<PlaywrightTestResults>): Actions => {
  const res = normalizeExhResponse(response)
  return {
    type: RUN_COMPLETE,
    results: res.data,
    error: res.error,
  }
}

export const toggleHeadless = (): Actions => ({
  type: TOGGLE_HEADLESS,
})
