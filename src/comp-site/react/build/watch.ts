import chokidar, { FSWatcher } from 'chokidar'
import { watch } from 'chokidar-debounced'
import { log, logStep, logSuccess } from '../../../cli/logging'
import { printBuildResult } from '../../../common/esbuilder'
import { CustomBuildResult } from '../../../common/types'
import { build } from './build'
import { BuildOptions } from './types'

const IGNORED_DIRS_FOR_WATCH_COMP_LIB = ['**/.exh/**/*', '**/node_modules/**/*']

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
  try {
    // First-build iteration
    const buildResult = await build(options)

    // Start rebuild loop
    initialBuildWatcher?.close()
    const rebuildWatcher = chokidar.watch(options.config.watch, { ignored: IGNORED_DIRS_FOR_WATCH_COMP_LIB })
    watch(() => rebuildIteration(buildResult, options), rebuildWatcher, 150, () => {
      console.log('Watching for changes...')
      options.onFirstSuccessfulBuildComplete?.()
      options.onSuccessfulBuildComplete?.()
    })
  }
  catch {
    // If the first-build has already failed, then we don't need to start a watch
    if (initialBuildWatcher != null)
      return

    // Else, start the first-build loop
    initialBuildWatcher = chokidar.watch(options.config.watch, { ignored: IGNORED_DIRS_FOR_WATCH_COMP_LIB })
    watch(
      () => watchCompSite(options),
      initialBuildWatcher,
      150,
      () => log('Watching for changes...'),
    )
  }
}
