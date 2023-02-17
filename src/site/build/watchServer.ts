import { ChildProcess, fork, ForkOptions } from 'child_process'
import chokidar, { FSWatcher } from 'chokidar'
import { watch } from 'chokidar-debounced'
import { BuildStatus } from '../../common/building'

import { EXH_SERVER_DEBUG_PORT } from '../../common/debug'
import { printBuildResult } from '../../common/esbuilder'
import { log, logSuccess } from '../../common/logging'
import { buildServer } from './buildServer'
import { CustomBuildResult, WatchServerOptions } from './types'

let serverProc: ChildProcess = null

const startServer = (options: WatchServerOptions) => {
  const forkOptions: ForkOptions = {
    env: {
      ...process.env,
      EXH_SITE_SERVER_PORT: options.serverPort.toString(),
      EXH_SITE_SERVER_HOST: options.serverHost,
    },
    execArgv: [`--inspect=127.0.0.1:${EXH_SERVER_DEBUG_PORT}`],
  }

  // Start server process with a custom debug port of 5004. This must be kept in-sync with /.vscode/launch.json
  serverProc = fork(options.outfile, forkOptions)
}

const startRebuildWatch = (options: WatchServerOptions, buildResult: CustomBuildResult) => {
  watch(() => {
    // Kill existing server process
    serverProc?.kill()
    log(`[${new Date().toLocaleTimeString()}] Changes detected, rebuilding server...`)
    options.buildStatusReporter.update(BuildStatus.IN_PROGRESS)
    const startTime = Date.now()
    // Rebuild server
    buildResult.buildResult.rebuild()
      .then(_result => {
        logSuccess(`(${Date.now() - startTime} ms) Done.${!options.verbose ? ' Watching for changes...' : ''}`)
        options.buildStatusReporter.update(BuildStatus.SUCCESS)
        // If verbose, print build info on every rebuild
        if (options.verbose) {
          printBuildResult(_result, startTime)
          log('Watching for changes...')
        }
        // Start server again
        startServer(options)
      })
      // Prevent from exiting the process, but still update reporter.
      .catch(() => {
        options.buildStatusReporter.update(BuildStatus.ERROR)
      })
  }, options.watchedDirPatterns, 150, () => log('Watching for changes...'))
}

let initialBuildWatcher: FSWatcher = null
export const watchServer = (options: WatchServerOptions) => {
  options.buildStatusReporter.update(BuildStatus.IN_PROGRESS)
  // Try initial build attempt
  buildServer(options)
    // If initial build successful, start rebuild watch
    .then(result => {
      options.buildStatusReporter.update(BuildStatus.SUCCESS)
      initialBuildWatcher?.close()
      // Start initial server process, before the first rebuild
      startServer(options)
      startRebuildWatch(options, result)
    })
    .catch(() => {
      options.buildStatusReporter.update(BuildStatus.ERROR)
      if (initialBuildWatcher != null)
        return
      initialBuildWatcher = chokidar.watch(options.watchedDirPatterns)
      watch(() => watchServer(options), initialBuildWatcher, 150, () => log('Watching for changes...'))
    })
}
