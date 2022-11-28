import chokidar, { FSWatcher } from 'chokidar'
import { watch } from 'chokidar-debounced'
import path from 'path'

import { printBuildResult } from '../../common/esbuilder'
import { CustomBuildResult } from '../../common/types'
import { Config } from '../types'
import { buildIndexExhTsFile, createIndexExhTsFile } from './indexExhFile'

const buildComponentLibrary = async (
  includeGlobPatterns: string[],
) => {
  await createIndexExhTsFile(includeGlobPatterns)
  return buildIndexExhTsFile()
}

const startRebuildWatch = (watchedDirPatterns: string[], buildResult: CustomBuildResult) => {
  const options = { verbose: false } // TODO: add to config
  watch(() => {
    console.log(`[${new Date().toLocaleTimeString()}] Changes detected, rebuilding component library...`)
    const startTime = Date.now()
    // Rebuild
    buildResult.buildResult.rebuild()
      .then(_result => {
        console.log(`(${Date.now() - startTime} ms) Done.${!options.verbose ? ' Watching for changes...' : ''}`)
        // If verbose, print build info on every rebuild
        if (options.verbose) {
          printBuildResult(_result, startTime, options.verbose)
          console.log('Watching for changes...')
        }
      })
      .catch(() => undefined) // Prevent from exiting the process
  }, watchedDirPatterns, 150, () => console.log('Watching for changes...'))
}

let initialBuildWatcher: FSWatcher = null
export const watchComponentLibrary = (
  config: Config,
  configDir: string,
) => {
  const includeGlobPatterns = config.include
    // eslint-disable-next-line prefer-regex-literals
    .map(globPattern => path.join(configDir, globPattern).replace(new RegExp('\\\\', 'g'), '/'))

  const watchGlobPatterns = config.watch
    // eslint-disable-next-line prefer-regex-literals
    .map(globPattern => path.join(configDir, globPattern).replace(new RegExp('\\\\', 'g'), '/'))

  // Try initial build attempt
  buildComponentLibrary(includeGlobPatterns)
    // If initial build successful, start rebuild watch
    .then(result => {
      initialBuildWatcher?.close()
      startRebuildWatch(watchGlobPatterns, result)
    })
    // Else, watch for changes until we get a successful initial build
    .catch(e => {
      console.log(e)
      if (initialBuildWatcher != null)
        return
      initialBuildWatcher = chokidar.watch(watchGlobPatterns, { ignored: '*.exh' })
      watch(() => watchComponentLibrary(config, configDir), initialBuildWatcher, 150, () => console.log('Watching for changes...'))
    })
}
