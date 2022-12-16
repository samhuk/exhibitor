import { exit } from 'process'
import { printError } from '../commandResult'

export const baseCommand = <TFn extends (...args: any[]) => any>(
  fn: TFn,
  commandName: string,
) => async (...args: Parameters<TFn>) => {
    try {
      await fn(...args)
    }
    catch (e: any) {
      printError({
        message: c => `An unexpected error occured for the '${c.bold(commandName)}' command.`,
        causedBy: e,
      })
      exit(1)
    }
  }
