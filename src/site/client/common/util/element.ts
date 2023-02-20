export const waitForElement = <T extends Element>(
  selector: () => T | null | undefined,
  options?: {
    timeoutS?: number
    pollingIntervalMs?: number
  },
): Promise<T> => new Promise((res, rej) => {
    let el = selector()
    if (el != null) {
      res(el)
    }
    else {
      let resolved = false
      const intervalMs = options?.pollingIntervalMs ?? 50
      const timeout = setInterval(() => {
        el = selector()
        if (el != null) {
          clearTimeout(timeout)
          res(el)
          resolved = true
        }
      }, intervalMs)

      if (options?.timeoutS != null) {
        setTimeout(() => {
          clearTimeout(timeout)
          if (!resolved)
            res(null)
        }, options.timeoutS * 1000)
      }
    }
  })
