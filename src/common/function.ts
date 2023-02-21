import { MutableRefObject } from 'react'

export const debounce = <TArgs extends any[], TReturn>(fn: (...args: TArgs) => TReturn, debounceMs: number = 250) => {
  let currentTimeout: any = null
  return (...args: TArgs) => {
    clearTimeout(currentTimeout)
    currentTimeout = setTimeout(() => {
      fn(...args)
    }, debounceMs)
  }
}

// eslint-disable-next-line no-promise-executor-return
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const waitForNotNullish = <T extends any>(
  selector: (() => T | null | undefined) | MutableRefObject<T>,
  options?: {
    timeoutS?: number
    pollingIntervalMs?: number
  },
): Promise<T> => new Promise((res, rej) => {
    const getResult = typeof selector === 'function' ? selector : () => selector.current
    let result = getResult()

    if (result != null) {
      res(result)
      return
    }

    let resolved = false
    const intervalMs = options?.pollingIntervalMs ?? 50
    let timeout: any = null

    const interval = setInterval(() => {
      result = getResult()
      if (result != null) {
        clearTimeout(interval)
        resolved = true
        if (timeout != null)
          clearTimeout(timeout)

        res(result)
      }
    }, intervalMs)

    if (options?.timeoutS != null) {
      timeout = setTimeout(() => {
        clearTimeout(interval)
        if (!resolved)
          res(null)
      }, options.timeoutS * 1000)
    }
  })
