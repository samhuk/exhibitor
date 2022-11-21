import { fork } from 'child_process'
import path from 'path'

import { NPM_PACKAGE_NAME } from '../common/name'
import { watchClient, watchServer } from '../site/build'
import { watchComponentLibrary } from './componentLibrary/watch'
import { Config } from './types'

const isTesting = process.env.IS_EXHIBITOR_TESTING === 'true'

export const start = (
  config: Config,
) => {
  watchComponentLibrary(config)

  // If in testing mode, we watch the site client and server
  if (isTesting) {
    watchClient()
    watchServer()
  }
  // Else, we execute the built site server js script that is in the node_modules lib dir
  else {
    let npmDir: string
    try {
      npmDir = require.resolve(NPM_PACKAGE_NAME)
    }
    catch {
      npmDir = `./node_modules/${NPM_PACKAGE_NAME}`
    }
    const serverJsPath = path.join(npmDir, './build/site-server/out.js').replace(/\\/g, '/')
    // eslint-disable-next-line import/no-dynamic-require, global-require
    fork(serverJsPath, { env: process.env })
  }
}
