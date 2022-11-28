import { FSWatcher, watch as _watch } from 'chokidar'

const debounce = <TArgs extends any[], TReturn>(fn: (...args: TArgs) => TReturn, debounceMs: number = 250) => {
  let currentTimeout: any = null
  return (...args: TArgs) => {
    clearTimeout(currentTimeout)
    currentTimeout = setTimeout(() => {
      fn(...args)
    }, debounceMs)
  }
}

export const watch = (fn: () => any, dirsOrWatcher: string[] | FSWatcher, delayMs?: number, onReadyFn?: () => any) => {
  const debouncedFn = debounce(fn, delayMs ?? 150)
  const watcher = Array.isArray(dirsOrWatcher) ? _watch(dirsOrWatcher) : dirsOrWatcher

  watcher.on('ready', () => {
    onReadyFn?.()
    watcher.on('all', () => {
      debouncedFn()
    })
  })
}

export default watch
