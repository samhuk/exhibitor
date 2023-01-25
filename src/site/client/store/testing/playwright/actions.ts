import { SerializedExhError } from '../../../../../common/exhError/serialization/types'
import { ExhResponse } from '../../../../common/responses'
import { RunPlayrightTestsResponse } from '../../../../common/testing/playwright'
import { NormalizedExhResponse } from '../../../misc'
import { LoadingState } from '../../types'

export const RUN = 'testing/playwright/run'

export const RUN_COMPLETE = 'testing/playwright/runComplete'

export const TOGGLE_HEADLESS = 'testing/playwright/toggleHeadless'

export type Options = {
  headless: boolean
}

export type State = {
  loadingState: LoadingState
  results: RunPlayrightTestsResponse
  dateLastStarted: number
  dateLastCompleted: number
  options: Options
  error: SerializedExhError
}

type RunAction = {
  type: typeof RUN
}

type RunCompleteAction = {
  type: typeof RUN_COMPLETE
  results: RunPlayrightTestsResponse
  error: any
}

type ToggleHeadlessAction = {
  type: typeof TOGGLE_HEADLESS
}

export type Actions = RunAction | RunCompleteAction | ToggleHeadlessAction

export const run = (): Actions => ({
  type: RUN,
})

// TODO: These response types are getting a bit tedious...
export const runComplete = (normalizedExhResponse: NormalizedExhResponse<ExhResponse<RunPlayrightTestsResponse>>): Actions => ({
  type: RUN_COMPLETE,
  results: normalizedExhResponse.data,
  error: normalizedExhResponse.error,
})

export const toggleHeadless = (): Actions => ({
  type: TOGGLE_HEADLESS,
})
