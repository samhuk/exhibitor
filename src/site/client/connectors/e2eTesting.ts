import { RunE2eTestOptions } from '../../common/e2eTesting'
import { post } from './core'

export const runE2eTest = (
  options: RunE2eTestOptions,
) => post<string>(
  'e2e-test',
  options,
)
