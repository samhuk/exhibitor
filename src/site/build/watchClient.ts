import chokidar, { FSWatcher } from 'chokidar'
import { watch } from 'chokidar-debounced'
import { BuildStatus } from '../../common/building'

import { printBuildResult } from '../../common/esbuilder'
import { log, logSuccess } from '../../common/logging'
import { buildClient } from './buildClient'
import { CustomBuildResult, WatchClientOptions } from './types'

const startRebuildWatch = (
  options: WatchClientOptions,
  buildResult: CustomBuildResult,
) => {
  watch(() => {
    log(`[${new Date().toLocaleTimeString()}] Changes detected, rebuilding client...`)
    options.buildStatusReporter.update(BuildStatus.IN_PROGRESS)
    const startTime = Date.now()
    // Rebuild client
    buildResult.buildResult.rebuild()
      .then(_result => {
        logSuccess(`(${Date.now() - startTime} ms) Done.${!options.verbose ? ' Watching for changes...' : ''}`)
        options.buildStatusReporter.update(BuildStatus.SUCCESS)
        // If verbose, print build info on every rebuild
        if (options.verbose) {
          printBuildResult(_result, startTime)
          log('Watching for changes...')
        }
      })
      // Prevent from exiting the process, but still update reporter.
      .catch(() => {
        options.buildStatusReporter.update(BuildStatus.ERROR)
      })
  }, options.watchedDirPatterns, 150, () => log('Watching for changes...'))
}

let initialBuildWatcher: FSWatcher = null
export const watchClient = (options: WatchClientOptions) => {
  options.buildStatusReporter.update(BuildStatus.IN_PROGRESS)

  // Try initial build attempt
  buildClient(options)
    // If initial build successful, start rebuild watch
    .then(result => {
      options.buildStatusReporter.update(BuildStatus.SUCCESS)
      initialBuildWatcher?.close()
      startRebuildWatch(options, result)
    })
    // Else, watch for changes until we get a successful initial build
    .catch(() => {
      options.buildStatusReporter.update(BuildStatus.ERROR)
      if (initialBuildWatcher != null)
        return
      initialBuildWatcher = chokidar.watch(options.watchedDirPatterns)
      watch(() => watchClient(options), initialBuildWatcher, 150, () => log('Watching for changes...'))
    })
}
