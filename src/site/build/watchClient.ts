import chokidar, { FSWatcher } from 'chokidar'
import { watch } from 'chokidar-debounced'
import { log, logSuccess } from '../../cli/logging'

import { printBuildResult } from '../../common/esbuilder'
import { buildClient } from './buildClient'
import { CustomBuildResult, WatchClientOptions } from './types'

const startRebuildWatch = (options: WatchClientOptions, buildResult: CustomBuildResult) => {
  watch(() => {
    log(`[${new Date().toLocaleTimeString()}] Changes detected, rebuilding client...`)
    const startTime = Date.now()
    // Rebuild client
    buildResult.buildResult.rebuild()
      .then(_result => {
        options.onSuccessfulBuildComplete?.()
        logSuccess(`(${Date.now() - startTime} ms) Done.${!options.verbose ? ' Watching for changes...' : ''}`)
        // If verbose, print build info on every rebuild
        if (options.verbose) {
          printBuildResult(_result, startTime)
          log('Watching for changes...')
        }
      })
      .catch(() => undefined) // Prevent from exiting the process
  }, options.watchedDirPatterns, 150, () => log('Watching for changes...'))
}

let initialBuildWatcher: FSWatcher = null
export const watchClient = (options: WatchClientOptions) => {
  // Try initial build attempt
  buildClient(options)
    // If initial build successful, start rebuild watch
    .then(result => {
      options?.onSuccessfulBuildComplete()
      initialBuildWatcher?.close()
      startRebuildWatch(options, result)
    })
    // Else, watch for changes until we get a successful initial build
    .catch(() => {
      if (initialBuildWatcher != null)
        return
      initialBuildWatcher = chokidar.watch(options.watchedDirPatterns)
      watch(() => watchClient(options), initialBuildWatcher, 150, () => log('Watching for changes...'))
    })
}
