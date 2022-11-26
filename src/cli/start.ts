import { fork } from 'child_process'
import path from 'path'

import { NPM_PACKAGE_NAME } from '../common/name'
import { createWatchClientOptions, watchClient } from '../site/build/watchClient'
import { createWatchServerOptions, watchServer } from '../site/build/watchServer'
import { watchComponentLibrary } from './componentLibrary/watch'
import { Config } from './types'

const isTesting = process.env.EXH_DEV === 'true'

export const start = (
  config: Config,
  configDir: string,
) => {
  watchComponentLibrary(config, configDir)

  // If in dev mode, we will also watch the site client and server
  if (isTesting) {
    watchClient(createWatchClientOptions())

    const watchServerOptions = createWatchServerOptions()
    if (config.site?.port != null)
      watchServerOptions.serverPort = config.site.port
    if (config.site?.host != null)
      watchServerOptions.serverHost = config.site.host
    watchServer(watchServerOptions)
  }
  // Else, we execute the built site server js script that's in the user's local node_modules lib dir
  else {
    let npmDir: string
    try {
      npmDir = require.resolve(NPM_PACKAGE_NAME)
    }
    catch {
      npmDir = `./node_modules/${NPM_PACKAGE_NAME}`
    }
    const serverJsPath = path.join(npmDir, './build/site-server/out.js').replace(/\\/g, '/')
    const env = {
      ...process.env,
      SERVER_PORT: config.site?.port?.toString() ?? '4001',
      SERVER_HOST: config.site?.host ?? 'localhost',
    }
    fork(serverJsPath, { env })
  }
}
