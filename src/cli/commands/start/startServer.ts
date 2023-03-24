import { ChildProcess, fork } from 'child_process'
import path from 'path'
import * as fs from 'fs'
import { createGFError, GFError, GFResult } from 'good-flow'
import { GFString } from 'good-flow/lib/good-flow/string/types'

import { CONFIG_FILE_PATH_ENV_VAR_NAME, VERBOSE_ENV_VAR_NAME } from '../../../common/config'
import { NPM_PACKAGE_CAPITALIZED_NAME, NPM_PACKAGE_NAME } from '../../../common/name'
import { SITE_SERVER_OUTFILE } from '../../../common/paths'
import { Config } from '../../../common/config/types'
import { ExhEnv, getEnv } from '../../../common/env'
import { logStep } from '../../../common/logging'
import { INTERCOM_PORT_ENV_VAR_NAME } from '../../../intercom/common'
import { tryResolve } from '../../../common/npm/resolve'

const exhEnv = getEnv()

const createStartServerError = (cause: GFString): GFError => createGFError({
  msg: `Could not start ${NPM_PACKAGE_NAME} Site Server.`,
  inner: createGFError({ msg: cause }),
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

const getExhibitorSiteServerIndexJsFilePath = (): GFResult<string> => {
  if (exhEnv === ExhEnv.DEV || exhEnv === ExhEnv.DEV_REL)
    return [SITE_SERVER_OUTFILE]

  const npmDir = tryResolve(NPM_PACKAGE_NAME)
  if (npmDir.success === false)
    return [undefined, createStartServerError(c => `Could not find the ${NPM_PACKAGE_CAPITALIZED_NAME} Site Server Javascript file to execute. Make sure the ${c.underline(NPM_PACKAGE_NAME)} NPM package is resolvable.`)]

  return [path.join(path.dirname(npmDir.path), './lib/site/server/index.js').replace(/\\/g, '/')]
}

export const startServer = async (options: {
  serverPort: number
  intercomPort: number,
  config: Config,
  onServerProcessKill?: () => void,
}): Promise<GFResult<ChildProcess>> => {
  const [serverJsPath, err] = getExhibitorSiteServerIndexJsFilePath()

  if (err != null)
    return [undefined, err]

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
  logStep(c => `Starting the ${NPM_PACKAGE_CAPITALIZED_NAME} server process (${c.cyan(serverJsPath)}).`, true)
  const serverProcess = fork(serverJsPath, { env })

  modifyServerProcessForKeyboardInput(serverProcess, options.onServerProcessKill)

  return [serverProcess]
}
