import { exit } from 'process'
import { createGFError, GFError } from 'good-flow'
import { ExhEnv, getEnv } from '../../common/env'

const isDev = getEnv() === ExhEnv.DEV

export const baseCommand = <TFn extends (...args: any[]) => Promise<GFError | null>>(
  commandName: string,
  fn: TFn,
  options?: { exitWhenReturns?: boolean },
) => async (...args: Parameters<TFn>) => {
    try {
      const err = await fn(...args)
      if (err != null) {
        err.log({
          customStackTraceRenderer: isDev ? undefined : () => [],
          nativeStackTraceRenderer: isDev ? undefined : () => [],
          linesBetweenNodes: 0,
        })
        exit(1)
      }
      else if (options?.exitWhenReturns ?? true) {
        exit(0)
      }
    }
    catch (e: any) {
      createGFError({
        msg: c => `An unexpected error occured for the '${c.bold(commandName)}' command.`,
        inner: e,
      }).log()
      exit(1)
    }
  }
