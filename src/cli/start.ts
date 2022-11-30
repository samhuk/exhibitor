import { fork } from 'child_process'
import path from 'path'

import { NPM_PACKAGE_NAME } from '../common/name'
import { SITE_SERVER_OUTFILE } from '../common/paths'
import { watchComponentLibrary } from './componentLibrary/watch'
import { Config } from './types'

const isDev = process.env.EXH_DEV === 'true'

export const start = (
  config: Config,
  configDir: string,
) => {
  watchComponentLibrary(config, configDir)

  let npmDir: string
  if (isDev)
    npmDir = './'
  else
    npmDir = `./node_modules/${NPM_PACKAGE_NAME}`

  const serverJsPath = path.join(npmDir, isDev ? SITE_SERVER_OUTFILE : './lib/site/server/index.js').replace(/\\/g, '/')
  const env = {
    ...process.env,
    SERVER_PORT: config.site?.port?.toString() ?? '4001',
    SERVER_HOST: config.site?.host ?? 'localhost',
  }
  // Execute the built site server js script that's in the user's local node_modules lib dir
  fork(serverJsPath, { env })
}
