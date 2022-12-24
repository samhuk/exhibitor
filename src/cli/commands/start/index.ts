import { exit } from 'process'
import { watchComponentLibrary } from '../../componentLibrary/watch'
import { ResolvedConfig } from '../../config/types'
import { printError } from '../../commandResult'
import { getConfigForCommand } from '../../config'
import { baseCommand } from '../common'
import { startServer } from './startServer'
import { applyStartOptionsToConfig } from './config'
import { StartCliArgumentsOptions } from './types'

const _watchComponentLibrary = async (
  config: ResolvedConfig,
): Promise<void> => new Promise<void>((res, rej) => {
  watchComponentLibrary(config, res)
})

export const start = baseCommand(async (startOptions: StartCliArgumentsOptions) => {
  // -- Config
  const result = getConfigForCommand(startOptions, applyStartOptionsToConfig)
  if (result.success === false) {
    printError(result.error)
    exit(1)
  }

  // -- Logic
  // Wait for component library to get its first successful build
  await _watchComponentLibrary(result.config)

  const startServerError = await startServer(result.config)

  // If command returned
  if (startServerError != null) {
    printError(startServerError)
    exit(1)
  }
}, 'start')
