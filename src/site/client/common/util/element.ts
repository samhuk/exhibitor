export const waitForElement = <T extends Element>(
  selector: () => T | null | undefined,
  pollingIntervalMs: number = 50,
): Promise<T> => new Promise((res, rej) => {
    let el = selector()
    if (el != null) {
      res(el)
    }
    else {
      const timeout = setInterval(() => {
        el = selector()
        if (el != null) {
          clearTimeout(timeout)
          res(el)
        }
      }, pollingIntervalMs)
    }
  })
