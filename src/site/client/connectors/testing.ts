import { RunPlaywrightTestsOptions, RunPlayrightTestsResponse } from '../../common/testing/playwright'
import { post } from './core'

export const runPlaywrightTests = (
  options: RunPlaywrightTestsOptions,
) => post<RunPlayrightTestsResponse>(
  'run-pw-tests',
  options,
)
