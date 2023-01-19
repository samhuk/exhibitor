import { ChildProcess, fork, ForkOptions } from 'child_process'
import chokidar, { FSWatcher } from 'chokidar'
import { watch } from 'chokidar-debounced'
import { log, logSuccess } from '../../cli/logging'

import { DEBUG_SERVER_PORT } from '../../common/debug'
import { printBuildResult } from '../../common/esbuilder'
import { buildServer } from './buildServer'
import { CustomBuildResult, WatchServerOptions } from './types'

let serverProc: ChildProcess = null

const startServer = (options: WatchServerOptions) => {
  const forkOptions: ForkOptions = {
    env: {
      ...process.env,
      SERVER_PORT: options.serverPort.toString(),
      SERVER_HOST: options.serverHost,
    },
    execArgv: [`--inspect=127.0.0.1:${DEBUG_SERVER_PORT}`],
  }

  // Start server process with a custom debug port of 5004. This must be kept in-sync with /.vscode/launch.json
  serverProc = fork(options.outfile, forkOptions)
}

const startRebuildWatch = (options: WatchServerOptions, buildResult: CustomBuildResult) => {
  watch(() => {
    // Kill existing server process
    serverProc?.kill()
    log(`[${new Date().toLocaleTimeString()}] Changes detected, rebuilding server...`)
    const startTime = Date.now()
    // Rebuild server
    buildResult.buildResult.rebuild().then(_result => {
      logSuccess(`(${Date.now() - startTime} ms) Done.${!options.verbose ? ' Watching for changes...' : ''}`)
      // If verbose, print build info on every rebuild
      if (options.verbose) {
        printBuildResult(_result, startTime)
        log('Watching for changes...')
      }
      // Start server again
      startServer(options)
    }).catch(() => undefined) // Prevent from exiting the process
  }, options.watchedDirPatterns, 150, () => log('Watching for changes...'))
}

let initialBuildWatcher: FSWatcher = null
export const watchServer = (options: WatchServerOptions) => {
  // Try initial build attempt
  buildServer(options)
    // If initial build successful, start rebuild watch
    .then(result => {
      initialBuildWatcher?.close()
      // Start initial server process, before the first rebuild
      startServer(options)
      startRebuildWatch(options, result)
    })
    .catch(() => {
      if (initialBuildWatcher != null)
        return
      initialBuildWatcher = chokidar.watch(options.watchedDirPatterns)
      watch(() => watchServer(options), initialBuildWatcher, 150, () => log('Watching for changes...'))
    })
}
