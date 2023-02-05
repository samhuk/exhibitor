import { exit } from 'process'
import { createExhError } from '../../common/exhError'
import { ExhError } from '../../common/exhError/types'

export const baseCommand = <TFn extends (...args: any[]) => Promise<ExhError | null>>(
  commandName: string,
  fn: TFn,
  options?: { exitWhenReturns?: boolean },
) => async (...args: Parameters<TFn>) => {
    try {
      const err = await fn(...args)
      if (err != null) {
        err.log()
        exit(1)
      }
      else if (options?.exitWhenReturns ?? true) {
        exit(0)
      }
    }
    catch (e: any) {
      createExhError({
        message: c => `An unexpected error occured for the '${c.bold(commandName)}' command.`,
        causedBy: e,
      }).log()
      exit(1)
    }
  }
