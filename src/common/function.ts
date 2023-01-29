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
