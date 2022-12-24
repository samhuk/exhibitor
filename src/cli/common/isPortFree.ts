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
