import path from 'path'
import { NPM_PACKAGE_NAME } from '../common/name'
import { TEST_COMPONENT_LIBRARY_ROOT_DIR } from '../common/paths'
import { watchClient, watchServer } from '../site/build'
import { buildIndexExhTsFile, createIndexExhTsFile } from './componentLibrary'
import watch from './componentLibrary/debouncedChokidar'
import { Config } from './types'

const isTesting = process.env.IS_EXHIBITOR_TESTING === 'true'

const iteration = async (
  includeGlobPatterns: string[],
) => {
  await createIndexExhTsFile(includeGlobPatterns)
  console.log('==> Building index.exh.ts file...')
  await buildIndexExhTsFile()
}

const watchComponentLibrary = async (
  config: Config,
) => {
  const includeGlobPatterns = isTesting
    ? config.include.map(globPattern => path.join(TEST_COMPONENT_LIBRARY_ROOT_DIR, globPattern))
    : config.include

  await iteration(includeGlobPatterns)

  console.log('==> Starting component library change watch...')
  watch(() => {
    console.log('Changes detected. Rebuilding...')
    iteration(includeGlobPatterns).then(() => undefined).catch(() => undefined)
  }, includeGlobPatterns, 150, () => {
    console.log('==> Watching for component library changes...')
  })
}

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
    const npmDir = require.resolve(NPM_PACKAGE_NAME)
    const serverJsPath = path.join(npmDir, './build/site-server/out.js')
    // eslint-disable-next-line import/no-dynamic-require, global-require
    require(serverJsPath)
  }
}
