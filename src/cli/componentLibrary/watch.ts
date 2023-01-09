import chokidar, { FSWatcher } from 'chokidar'
import { watch } from 'chokidar-debounced'

import { printBuildResult } from '../../common/esbuilder'
import { setMetadata } from '../../common/metadata'
import { CustomBuildResult } from '../../common/types'
import { ResolvedConfig } from '../config/types'
import { logStep, logSuccess } from '../logging'
import { buildIndexExhTsFile, createIndexExhTsFile } from './indexExhFile'

const IGNORED_DIRS_FOR_WATCH_COMP_LIB = ['**/.exh/**/*', '**/node_modules/**/*']

const checkWhetherAxeIsInstalled = () => {
  const _path = require.resolve('axe-core')
  return _path != null
}

const _createIndexExhTsFile = async (
  config: ResolvedConfig,
) => {
  const { includedFilePaths } = await createIndexExhTsFile(config.include, config.rootStyle)
  logStep('Creating metadata.json file', true)
  setMetadata({
    includedFilePaths,
    siteTitle: config.site.title,
    isAxeEnabled: checkWhetherAxeIsInstalled(),
  })
  return { includedFilePaths }
}

const rebuildIteration = async (
  buildResult: CustomBuildResult,
  config: ResolvedConfig,
) => {
  logStep(`[${new Date().toLocaleTimeString()}] Changes detected, rebuilding component library...`)

  try {
    const startTime = Date.now()
    await _createIndexExhTsFile(config)
    const rebuildResult = await buildResult.buildResult.rebuild()
    logSuccess(`(${Date.now() - startTime} ms) Done.${!config.verbose ? ' Watching for changes...' : ''}`)
    // If verbose, print build info on every rebuild
    if (config.verbose) {
      printBuildResult(rebuildResult, startTime)
      logStep('Watching for changes...')
    }
  }
  catch {
    // Silence errors, since esbuild prints them already.
  }
}

let initialBuildWatcher: FSWatcher = null
export const watchComponentLibrary = async (
  config: ResolvedConfig,
  onFirstSuccessfulBuild?: () => void,
) => {
  try {
    const { includedFilePaths } = await _createIndexExhTsFile(config)
    const buildResult = await buildIndexExhTsFile(config, includedFilePaths)()
    initialBuildWatcher?.close()
    const rebuildWatcher = chokidar.watch(config.watch, { ignored: IGNORED_DIRS_FOR_WATCH_COMP_LIB })
    watch(() => rebuildIteration(buildResult, config), rebuildWatcher, 150, () => {
      console.log('Watching for changes...')
      onFirstSuccessfulBuild?.()
    })
  }
  catch {
    if (initialBuildWatcher != null)
      return
    initialBuildWatcher = chokidar.watch(config.watch, { ignored: IGNORED_DIRS_FOR_WATCH_COMP_LIB })
    watch(
      () => watchComponentLibrary(config, onFirstSuccessfulBuild),
      initialBuildWatcher,
      150,
      () => console.log('Watching for changes...'),
    )
  }
}
