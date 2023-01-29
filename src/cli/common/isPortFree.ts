import { Socket } from 'net'

export const determineIfPortFree = (host: string, port: number): Promise<boolean> => new Promise<boolean>((res, rej) => {
  const socket = new Socket()
  const tidy = () => {
    if (socket != null) {
      socket.removeAllListeners('connect')
      socket.removeAllListeners('error')
      socket.end()
      socket.destroy()
      socket.unref()
    }
  }
  socket.once('connect', () => {
    tidy()
    res(false)
  })
  socket.once('error', err => {
    if ((err as any).code !== 'ECONNREFUSED') {
      tidy()
      rej(err)
    }

    tidy()
    res(true)
  })
  socket.connect({ port, host }, () => {})
})

export const findFreePort = async (options: {
  host: string
  preferredPort: number
  exclusions?: number[]
  maxAttempts: number
  events?: {
    onAttemptStart?: (port: number) => void
    onAttemptExcluded?: (port: number) => void
    onAttemptUnexpectedError?: (port: number, err: any) => { exit: boolean }
    onAttemptFail?: (port: number) => void
    onAttemptSuccess?: (port: number) => void
    onMaxAttempts?: () => void
  }
}): Promise<number | null> => {
  let i = 0
  let port = options.preferredPort
  while (i < options.maxAttempts) {
    options.events?.onAttemptStart?.(port)

    // If port is excluded, skip iteration to next port
    if (options.exclusions.indexOf(port) !== -1) {
      options.events?.onAttemptExcluded?.(port)
    }
    else {
      let isPortFree: boolean = false
      try {
        // eslint-disable-next-line no-await-in-loop
        isPortFree = await determineIfPortFree(options.host, port)
      }
      catch (err) {
        const result = options.events?.onAttemptUnexpectedError?.(port, err)
        if (result?.exit ?? true)
          return null
      }

      // If port is available, return it
      if (isPortFree) {
        options.events?.onAttemptSuccess?.(port)
        return port
      }

      // If port is not available, go to next port
      options.events?.onAttemptFail?.(port)
    }

    i += 1
    port += 1
  }

  options.events?.onMaxAttempts?.()
  return null
}
