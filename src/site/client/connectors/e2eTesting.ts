import { PlaywrightTestResults, RunE2eTestOptions } from '../../common/e2eTesting'
import { post } from './core'

export const runE2eTest = (
  options: RunE2eTestOptions,
) => post<PlaywrightTestResults>(
  'e2e-test',
  options,
)
