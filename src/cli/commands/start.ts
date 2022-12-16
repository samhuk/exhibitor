import * as fs from 'fs'
import { fork } from 'child_process'
import { Socket } from 'net'
import path from 'path'

import { exit } from 'process'
import { NPM_PACKAGE_NAME } from '../../common/name'
import { SITE_SERVER_OUTFILE } from '../../common/paths'
import { watchComponentLibrary } from '../componentLibrary/watch'
import { ResolvedConfig } from '../config/types'
import { CliError, printError } from '../commandResult'
import { BaseCliArgumentsOptions, CliString } from '../types'
import { getConfigForCommand } from '../config'
import { baseCommand } from './common'

type StartCliArgumentsOptions = BaseCliArgumentsOptions & {
  port?: string
  host?: string
}

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
  config: ResolvedConfig,
): Promise<void> => new Promise<void>((res, rej) => {
  watchComponentLibrary(config, res)
})

const createStartServerError = (causedBy: CliString): CliError => ({
  message: `Could not start the ${NPM_PACKAGE_NAME} server.`,
  causedBy,
})

const startServer = async (
  config: ResolvedConfig,
): Promise<CliError | null> => {
  const npmDir = isDev ? './' : `./node_modules/${NPM_PACKAGE_NAME}`
  const serverJsPath = path.join(npmDir, isDev ? SITE_SERVER_OUTFILE : './lib/site/server/index.js').replace(/\\/g, '/')

  if (!fs.existsSync(serverJsPath))
    return createStartServerError(c => `Could not find the ${NPM_PACKAGE_NAME} server javascript to execute at ${c.cyan(serverJsPath)}`)

  const portStr = config.site.port.toString()

  const env = {
    ...process.env,
    SERVER_PORT: portStr,
    SERVER_HOST: config.site.host,
  }

  // Check if port is free
  let isPortFree: boolean
  try {
    isPortFree = await determineIfPortFree(config.site.host, config.site.port)
  }
  catch (err) {
    return createStartServerError(`An unexpected error occured. Details: ${err}.`)
  }

  if (!isPortFree)
    return createStartServerError(c => `Port ${(c.cyan as any).bold(portStr)} is not available (attempted url: ${c.cyan(`${config.site.host}:${portStr}`)}).`)

  // Execute the built site server js script that's in the user's local node_modules lib dir
  fork(serverJsPath, { env })

  return null
}

const applyStartOptionsToConfig = (
  config: ResolvedConfig,
  options: StartCliArgumentsOptions,
): CliError | null => {
  if (options.host != null)
    config.site.host = options.host

  if (options.port != null) {
    const parsedPort = parseInt(options.port)
    if (Number.isNaN(parsedPort)) {
      return {
        message: 'Could not parse CLI arguments',
        causedBy: c => `argument 'port' is not a valid integer. Received: ${c.cyan(JSON.stringify(options.port))}`,
      }
    }

    config.site.port = parsedPort
  }

  return null
}

export const start = baseCommand(async (startOptions: StartCliArgumentsOptions) => {
  // -- Config
  const result = getConfigForCommand(startOptions, applyStartOptionsToConfig)
  if (result.success === false) {
    printError(result.error)
    exit(1)
  }

  // -- Logic
  // Wait for component library to get its first successful build
  await _watchComponentLibrary(result.config)

  const startServerError = await startServer(result.config)

  // If command returned
  if (startServerError != null) {
    printError(startServerError)
    exit(1)
  }
}, 'start')
