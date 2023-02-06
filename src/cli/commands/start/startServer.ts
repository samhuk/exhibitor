import { ChildProcess, fork } from 'child_process'
import path from 'path'
import * as fs from 'fs'
import { CONFIG_FILE_PATH_ENV_VAR_NAME, VERBOSE_ENV_VAR_NAME } from '../../../common/config'
import { NPM_PACKAGE_CAPITALIZED_NAME, NPM_PACKAGE_NAME } from '../../../common/name'
import { SITE_SERVER_OUTFILE } from '../../../common/paths'
import { Config } from '../../../common/config/types'
import { ExhEnv, getEnv } from '../../../common/env'
import { INTERCOM_PORT_ENV_VAR_NAME } from '../../../intercom'
import { ExhString } from '../../../common/exhString/types'
import { ExhError } from '../../../common/exhError/types'
import { logStep } from '../../../common/logging'
import { createExhError } from '../../../common/exhError'

const exhEnv = getEnv()

const createStartServerError = (causedBy: ExhString): ExhError => createExhError({
  message: `Could not start the ${NPM_PACKAGE_NAME} server.`,
  causedBy,
})

const modifyServerProcessForKeyboardInput = (
  p: ChildProcess,
  onServerProcessKill?: () => void,
): void => {
  process.stdin.setRawMode(true)
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', key => {
    // ctrl-c (end of text)
    // @ts-ignore
    if (key === '\u0003') {
      logStep(`Stopping ${NPM_PACKAGE_CAPITALIZED_NAME}`)
      p.kill()
      onServerProcessKill?.()
    }

    // write the key to stdout all normal like
    process.stdout.write(key)
  })
}

export const startServer = async (options: {
  serverPort: number
  intercomPort: number,
  config: Config,
  onServerProcessKill?: () => void,
}): Promise<ExhError | ChildProcess> => {
  const serverJsPath = exhEnv === ExhEnv.DEV || exhEnv === ExhEnv.DEV_REL
    ? SITE_SERVER_OUTFILE
    : path.join(`./node_modules/${NPM_PACKAGE_NAME}`, './lib/site/server/index.js').replace(/\\/g, '/')

  if (!fs.existsSync(serverJsPath))
    return createStartServerError(c => `Could not find the ${NPM_PACKAGE_NAME} server javascript to execute at ${c.cyan(serverJsPath)}`)

  // Build up the env for the Exhibitor Site server process
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    EXH_CLI: 'true',
    EXH_SITE_SERVER_PORT: options.serverPort.toString(),
    EXH_SITE_SERVER_HOST: options.config.site.host,
    [VERBOSE_ENV_VAR_NAME]: options.config.verbose.toString(),
    [CONFIG_FILE_PATH_ENV_VAR_NAME]: options.config.rootConfigFile,
    [INTERCOM_PORT_ENV_VAR_NAME]: options.intercomPort.toString(),
  }

  // Execute the built site server js script
  logStep(c => `Starting the Exhibitor server process (${c.cyan(serverJsPath)})`, true)
  const serverProcess = fork(serverJsPath, { env })

  modifyServerProcessForKeyboardInput(serverProcess, options.onServerProcessKill)

  return serverProcess
}
