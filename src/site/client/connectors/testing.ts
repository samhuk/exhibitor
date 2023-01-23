import { PlaywrightTestResults, RunE2eTestOptions } from '../../common/e2eTesting'
import { post } from './core'

export const runPlaywrightTests = (
  options: RunE2eTestOptions,
) => post<PlaywrightTestResults>(
  'run-pw-tests',
  options,
  null,
  { responseType: 'text' },
)
