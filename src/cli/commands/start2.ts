import { exit } from 'process'
import { printCliString, printError } from '../commandResult'
import { getConfigForCommand } from '../config'
import { baseCommand } from './common'
import { applyStartOptionsToConfig, StartCliArgumentsOptions } from './start'

export const start = baseCommand(async (startOptions: StartCliArgumentsOptions) => {
  // -- Config
  const result = getConfigForCommand(startOptions, applyStartOptionsToConfig)
  if (result.success === false) {
    printError(result.error)
    exit(1)
  }

  // -- Logic
  printCliString(c => `${c.yellow('Warn: \'start2\' command is currently in alpha')}`)

  exit(0)
}, 'start2')
