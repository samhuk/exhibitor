import chokidar, { FSWatcher } from 'chokidar'
import { watch } from 'chokidar-debounced'

import { printBuildResult } from '../../common/esbuilder'
import { setMetadata } from '../../common/metadata'
import { CustomBuildResult } from '../../common/types'
import { ResolvedConfig } from '../config/types'
import { buildIndexExhTsFile, createIndexExhTsFile } from './indexExhFile'

const _createIndexExhTsFile = async (
  config: ResolvedConfig,
) => {
  const { includedFilePaths } = await createIndexExhTsFile(config.include, config.rootStyle)
  setMetadata({
    includedFilePaths,
    siteTitle: config.site.title,
  })
}

const rebuildIteration = async (
  buildResult: CustomBuildResult,
  config: ResolvedConfig,
) => {
  console.log(`[${new Date().toLocaleTimeString()}] Changes detected, rebuilding component library...`)

  const options = { verbose: false } // TODO: add to config
  try {
    const startTime = Date.now()
    await _createIndexExhTsFile(config)
    const rebuildResult = await buildResult.buildResult.rebuild()
    console.log(`(${Date.now() - startTime} ms) Done.${!options.verbose ? ' Watching for changes...' : ''}`)
    // If verbose, print build info on every rebuild
    if (options.verbose) {
      printBuildResult(rebuildResult, startTime, options.verbose)
      console.log('Watching for changes...')
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
    await _createIndexExhTsFile(config)
    const buildResult = await buildIndexExhTsFile()
    onFirstSuccessfulBuild?.()
    initialBuildWatcher?.close()
    const rebuildWatcher = chokidar.watch(config.watch, { ignored: ['**/.exh/**/*', '**/node_modules/**/*'] })
    watch(() => rebuildIteration(buildResult, config), rebuildWatcher, 150, () => console.log('Watching for changes...'))
  }
  catch {
    if (initialBuildWatcher != null)
      return
    initialBuildWatcher = chokidar.watch(config.watch, { ignored: ['**/.exh/**/*', '**/node_modules/**/*'] })
    watch(
      () => watchComponentLibrary(config, onFirstSuccessfulBuild),
      initialBuildWatcher,
      150,
      () => console.log('Watching for changes...'),
    )
  }
}
