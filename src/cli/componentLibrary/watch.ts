import chokidar, { FSWatcher } from 'chokidar'
import { watch } from 'chokidar-debounced'
import * as fs from 'fs'

import { printBuildResult } from '../../common/esbuilder'
import { MetaData } from '../../common/metadata'
import { META_DATA_FILE } from '../../common/paths'
import { CustomBuildResult } from '../../common/types'
import { makePathRelativeToConfigDir, makePathsRelativeToConfigDir } from '../config'
import { Config } from '../types'
import { buildIndexExhTsFile, createIndexExhTsFile } from './indexExhFile'

const createMetaDataFile = (
  includedFilePaths: string[],
) => {
  const metaData: MetaData = {
    includedFilePaths,
  }
  fs.writeFileSync(META_DATA_FILE, JSON.stringify(metaData, null, 2))
}

const _createIndexExhTsFile = async (
  includeGlobPatterns: string[],
  rootStylePath?: string,
) => {
  const { includedFilePaths } = await createIndexExhTsFile(includeGlobPatterns, rootStylePath)
  createMetaDataFile(includedFilePaths)
}

const rebuildIteration = async (
  buildResult: CustomBuildResult,
  includeGlobPatterns: string[],
  rootStylePath?: string,
) => {
  console.log(`[${new Date().toLocaleTimeString()}] Changes detected, rebuilding component library...`)

  const options = { verbose: false } // TODO: add to config
  try {
    const startTime = Date.now()
    await _createIndexExhTsFile(includeGlobPatterns, rootStylePath)
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
  config: Config,
  configDir: string,
  onFirstSuccessfulBuild: () => void,
) => {
  const includeGlobPatterns = makePathsRelativeToConfigDir(config.include, configDir)
  const watchGlobPatterns = makePathsRelativeToConfigDir(config.watch, configDir)
  const rootStylePath = config.rootStyle != null ? makePathRelativeToConfigDir(config.rootStyle, configDir) : null

  try {
    await _createIndexExhTsFile(includeGlobPatterns, rootStylePath)
    const buildResult = await buildIndexExhTsFile()
    onFirstSuccessfulBuild()
    initialBuildWatcher?.close()
    const rebuildWatcher = chokidar.watch(watchGlobPatterns, { ignored: ['**/.exh/**/*', '**/node_modules/**/*'] })
    watch(() => rebuildIteration(buildResult, includeGlobPatterns, rootStylePath), rebuildWatcher, 150, () => console.log('Watching for changes...'))
  }
  catch {
    if (initialBuildWatcher != null)
      return
    initialBuildWatcher = chokidar.watch(watchGlobPatterns, { ignored: ['**/.exh/**/*', '**/node_modules/**/*'] })
    watch(
      () => watchComponentLibrary(config, configDir, onFirstSuccessfulBuild),
      initialBuildWatcher,
      150,
      () => console.log('Watching for changes...'),
    )
  }
}
