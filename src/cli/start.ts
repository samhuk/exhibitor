import * as fs from 'fs'
import { fork } from 'child_process'
import { Socket } from 'net'
import path from 'path'

import { NPM_PACKAGE_NAME } from '../common/name'
import { SITE_SERVER_OUTFILE } from '../common/paths'
import { watchComponentLibrary } from './componentLibrary/watch'
import { Config } from './types'
import { CommandResult, errorResult } from './commandResult'

const isDev = process.env.EXH_DEV === 'true'

const determineIfPortFree = (host: string, port: number): Promise<boolean> => new Promise<boolean>((res, rej) => {
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

const _watchComponentLibrary = async (
  config: Config,
  configDir: string,
): Promise<void> => new Promise<void>((res, rej) => {
  watchComponentLibrary(config, configDir, res)
})

const startServer = async (
  config: Config,
  configDir: string,
): Promise<CommandResult> => {
  const npmDir = isDev ? './' : `./node_modules/${NPM_PACKAGE_NAME}`
  const serverJsPath = path.join(npmDir, isDev ? SITE_SERVER_OUTFILE : './lib/site/server/index.js').replace(/\\/g, '/')

  if (!fs.existsSync(serverJsPath)) {
    return errorResult({
      message: 'Could not start the exhibitor server.',
      causedBy: c => `Could not find the exhibitor server javascript to execute at ${c.cyan(serverJsPath)}`,
    })
  }

  // TODO: Need to create new config type called "resolved config" or something
  const host = config.site?.host
  const port = config.site?.port
  const portStr = port?.toString()

  const env = {
    ...process.env,
    SERVER_PORT: portStr,
    SERVER_HOST: host,
  }

  // Check if port is free
  let isPortFree: boolean
  try {
    isPortFree = await determineIfPortFree(host, port)
  }
  catch (err) {
    return errorResult({
      message: 'Could not start the exhibitor server.',
      causedBy: `An unexpected error occured. Details: ${err}.`,
    })
  }

  if (!isPortFree) {
    return errorResult({
      message: 'Could not start the exhibitor server.',
      causedBy: c => `Port ${(c.cyan as any).bold(portStr)} is not available (attempted url: ${c.cyan(`${host}:${portStr}`)}).`,
    })
  }

  console.log('starting server...')
  // Execute the built site server js script that's in the user's local node_modules lib dir
  fork(serverJsPath, { env })

  return { success: true }
}

export const start = async (
  config: Config,
  configDir: string,
): Promise<CommandResult> => {
  // Wait for component library to get its first successful build
  await _watchComponentLibrary(config, configDir)

  const result = await startServer(config, configDir)

  return result
}
