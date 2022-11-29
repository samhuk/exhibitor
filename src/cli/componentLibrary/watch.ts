import chokidar, { FSWatcher } from 'chokidar'
import { watch } from 'chokidar-debounced'
import path from 'path'

import { printBuildResult } from '../../common/esbuilder'
import { CustomBuildResult } from '../../common/types'
import { Config } from '../types'
import { buildIndexExhTsFile, createIndexExhTsFile } from './indexExhFile'

const rebuildIteration = async (
  buildResult: CustomBuildResult,
  includeGlobPatterns: string[],
) => {
  console.log(`[${new Date().toLocaleTimeString()}] Changes detected, rebuilding component library...`)

  const options = { verbose: false } // TODO: add to config
  try {
    const startTime = Date.now()
    await createIndexExhTsFile(includeGlobPatterns)
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

const startRebuildWatch = (
  watchedDirPatterns: string[],
  includeGlobPatterns: string[],
  buildResult: CustomBuildResult,
  config: Config,
) => {
  watch(() => rebuildIteration(buildResult, includeGlobPatterns), watchedDirPatterns, 150, () => console.log('Watching for changes...'))
}

const makePathsRelativeToConfigDir = (paths: string[], configDir: string): string[] => paths
  // eslint-disable-next-line prefer-regex-literals
  .map(globPattern => path.join(configDir, globPattern).replace(new RegExp('\\\\', 'g'), '/'))

let initialBuildWatcher: FSWatcher = null
export const watchComponentLibrary = async (
  config: Config,
  configDir: string,
) => {
  const includeGlobPatterns = makePathsRelativeToConfigDir(config.include, configDir)
  const watchGlobPatterns = makePathsRelativeToConfigDir(config.watch, configDir)

  try {
    await createIndexExhTsFile(includeGlobPatterns)
    const buildResult = await buildIndexExhTsFile()
    initialBuildWatcher?.close()
    startRebuildWatch(watchGlobPatterns, includeGlobPatterns, buildResult, config)
  }
  catch (e) {
    console.log(e)
    if (initialBuildWatcher != null)
      return
    initialBuildWatcher = chokidar.watch(watchGlobPatterns, { ignored: '*.exh' })
    watch(() => watchComponentLibrary(config, configDir), initialBuildWatcher, 150, () => console.log('Watching for changes...'))
  }
}
