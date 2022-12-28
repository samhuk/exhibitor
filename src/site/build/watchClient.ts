import chokidar, { FSWatcher } from 'chokidar'
import { watch } from 'chokidar-debounced'

import { printBuildResult } from '../../common/esbuilder'
import { SITE_CLIENT_DIR, SITE_CLIENT_OUTDIR, SITE_COMMON_DIR } from '../../common/paths'
import { buildClient } from './buildClient'
import { CustomBuildResult, WatchClientOptions } from './types'

const startRebuildWatch = (options: WatchClientOptions, buildResult: CustomBuildResult) => {
  watch(() => {
    console.log(`[${new Date().toLocaleTimeString()}] Changes detected, rebuilding client...`)
    const startTime = Date.now()
    // Rebuild client
    buildResult.buildResult.rebuild()
      .then(_result => {
        console.log(`(${Date.now() - startTime} ms) Done.${!options.verbose ? ' Watching for changes...' : ''}`)
        // If verbose, print build info on every rebuild
        if (options.verbose) {
          printBuildResult(_result, startTime)
          console.log('Watching for changes...')
        }
      })
      .catch(() => undefined) // Prevent from exiting the process
  }, options.watchedDirPatterns, 150, () => console.log('Watching for changes...'))
}

let initialBuildWatcher: FSWatcher = null
export const watchClient = (options: WatchClientOptions) => {
  // Try initial build attempt
  buildClient(options)
    // If initial build successful, start rebuild watch
    .then(result => {
      initialBuildWatcher?.close()
      startRebuildWatch(options, result)
    })
    // Else, watch for changes until we get a successful initial build
    .catch(() => {
      if (initialBuildWatcher != null)
        return
      initialBuildWatcher = chokidar.watch(options.watchedDirPatterns)
      watch(() => watchClient(options), initialBuildWatcher, 150, () => console.log('Watching for changes...'))
    })
}

export const createWatchClientOptions = (): WatchClientOptions => {
  const isDev = process.env.EXH_DEV === 'true'

  return {
    verbose: isDev,
    sourceMap: isDev,
    gzip: !isDev,
    incremental: isDev,
    minify: !isDev,
    outDir: SITE_CLIENT_OUTDIR,
    watchedDirPatterns: [SITE_CLIENT_DIR, SITE_COMMON_DIR],
  }
}
