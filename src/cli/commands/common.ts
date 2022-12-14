import { exit } from 'process'
import { handleError } from '../error'
import { CliError } from '../types'

export const endSuccessfulCommand = () => {
  exit(0) // TODO: Remove once ready
}

export const baseCommand = <TFn extends (...args: any[]) => Promise<CliError | null>>(
  commandName: string,
  fn: TFn,
  options?: { exitWhenReturns?: boolean },
) => async (...args: Parameters<TFn>) => {
    try {
      const commandError = await fn(...args)
      if (commandError != null)
        handleError(commandError)
      else if (options?.exitWhenReturns ?? true)
        endSuccessfulCommand()
    }
    catch (e: any) {
      handleError({
        message: c => `An unexpected error occured for the '${c.bold(commandName)}' command.`,
        causedBy: e,
      })
    }
  }
