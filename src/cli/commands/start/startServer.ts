import { fork } from 'child_process'
import path from 'path'
import * as fs from 'fs'
import { NPM_PACKAGE_NAME } from '../../../common/name'
import { SITE_SERVER_OUTFILE } from '../../../common/paths'
import { CliError } from '../../commandResult'
import { determineIfPortFree } from '../../common/isPortFree'
import { ResolvedConfig } from '../../config/types'
import { CliString } from '../../types'

const isDev = process.env.EXH_DEV === 'true'

const createStartServerError = (causedBy: CliString): CliError => ({
  message: `Could not start the ${NPM_PACKAGE_NAME} server.`,
  causedBy,
})

export const startServer = async (
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
