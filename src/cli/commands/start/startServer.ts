import { ChildProcess, fork } from 'child_process'
import path from 'path'
import * as fs from 'fs'
import { CONFIG_FILE_PATH_ENV_VAR_NAME } from '../../../common/config'
import { NPM_PACKAGE_NAME } from '../../../common/name'
import { SITE_SERVER_OUTFILE } from '../../../common/paths'
import { determineIfPortFree } from '../../common/isPortFree'
import { CliError, CliString } from '../../types'
import { logStep, logSuccess } from '../../logging'
import { Config } from '../../../common/config/types'

const isDev = process.env.EXH_DEV === 'true'

const createStartServerError = (causedBy: CliString): CliError => ({
  message: `Could not start the ${NPM_PACKAGE_NAME} server.`,
  causedBy,
})

export const startServer = async (
  config: Config,
): Promise<CliError | ChildProcess> => {
  const serverJsPath = isDev
    ? SITE_SERVER_OUTFILE
    : path.join(`./node_modules/${NPM_PACKAGE_NAME}`, './lib/site/server/index.js').replace(/\\/g, '/')

  if (!fs.existsSync(serverJsPath))
    return createStartServerError(c => `Could not find the ${NPM_PACKAGE_NAME} server javascript to execute at ${c.cyan(serverJsPath)}`)

  const portStr = config.site.port.toString()

  // Build up the env for the Exhibitor Site server process
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    SERVER_PORT: portStr,
    SERVER_HOST: config.site.host,
    [CONFIG_FILE_PATH_ENV_VAR_NAME]: config.rootConfigFile,
  }

  // Check if port is free
  logStep(c => `Determining if port ${c.cyan(portStr)} is available to use for the Exhibitor server.`, true)
  let isPortFree: boolean
  try {
    isPortFree = await determineIfPortFree(config.site.host, config.site.port)
  }
  catch (err) {
    return createStartServerError(`An unexpected error occured while determining whether port ${config.site.port} is available to use.\n\n    Details: ${err}.`)
  }

  if (!isPortFree)
    return createStartServerError(c => `Port ${(c.cyan as any).bold(portStr)} is not available (attempted url: ${c.cyan(`${config.site.host}:${portStr}`)}).`)

  logSuccess(c => `Port ${c.cyan(portStr)} is available to use.`, true)

  // Execute the built site server js script
  logStep(c => `Starting the Exhibitor server process (${c.cyan(serverJsPath)})`, true)
  return fork(serverJsPath, { env })
}
