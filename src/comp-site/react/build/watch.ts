import chokidar, { FSWatcher } from 'chokidar'
import { logStep, logSuccess } from '../../../cli/logging'
import { printBuildResult } from '../../../common/esbuilder'
import { debounce } from '../../../common/function'
import { CustomBuildResult } from '../../../common/types'
import { build } from './build'
import { BuildOptions } from './types'

const IGNORED_DIRS_FOR_WATCH_COMP_LIB = ['**/.exh/**/*', '**/node_modules/**/*'] as const

const rebuildIteration = async (
  buildResult: CustomBuildResult,
  options: BuildOptions,
) => {
  logStep(`[${new Date().toLocaleTimeString()}] Changes detected, rebuilding component library...`)

  try {
    const startTime = Date.now()
    const rebuildResult = await buildResult.buildResult.rebuild()
    options.onSuccessfulBuildComplete?.()
    logSuccess(`(${Date.now() - startTime} ms) Done.${!options.config.verbose ? ' Watching for changes...' : ''}`)
    // If verbose, print build info on every rebuild
    if (options.config.verbose) {
      printBuildResult(rebuildResult, startTime)
      logStep('Watching for changes...')
    }
  }
  catch {
    // Silence errors, since esbuild prints them already.
  }
}

let initialBuildWatcher: FSWatcher = null
export const watchCompSite = async (
  options: BuildOptions,
) => {
  const ignoredWatchPatterns = [...IGNORED_DIRS_FOR_WATCH_COMP_LIB, ...options.config.watchExclude]
  try {
    // First-build iteration
    const buildResult = await build(options)

    // Start rebuild loop
    initialBuildWatcher?.close()
    const fn = debounce(() => rebuildIteration(buildResult, options), 200)
    const watcher = chokidar
      .watch(options.config.watch, { ignored: ignoredWatchPatterns })
      .on('ready', () => {
        logStep('Watching for changes...')
        options.onFirstSuccessfulBuildComplete?.()
        options.onSuccessfulBuildComplete?.()
        watcher.on('add', fn).on('change', fn).on('unlink', fn)
      })
  }
  catch {
    // If the first-build has already failed, then we don't need to start a watch
    if (initialBuildWatcher != null)
      return

    // Else, start the first-build loop
    const fn = debounce(() => watchCompSite(options), 200)
    initialBuildWatcher = chokidar
      .watch(options.config.watch, { ignored: ignoredWatchPatterns })
      .on('ready', () => {
        logStep('Watching for changes...')
        initialBuildWatcher.on('add', fn).on('change', fn).on('unlink', fn)
      })
  }
}
