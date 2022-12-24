import { exit } from 'process'
import { CliError, handleError, printError } from '../commandResult'

export const endSuccessfulCommand = () => {
  exit(0) // TODO: Remove once ready
}

export const baseCommand = <TFn extends (...args: any[]) => Promise<CliError | null>>(
  fn: TFn,
  commandName: string,
) => async (...args: Parameters<TFn>) => {
    try {
      const commandError = await fn(...args)
      if (commandError != null)
        handleError(commandError)
      else
        endSuccessfulCommand()
    }
    catch (e: any) {
      printError({
        message: c => `An unexpected error occured for the '${c.bold(commandName)}' command.`,
        causedBy: e,
      })
      exit(1)
    }
  }
