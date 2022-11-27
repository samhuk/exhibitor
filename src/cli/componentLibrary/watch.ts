import path from 'path'

import { Config } from '../types'
import watch from './debouncedChokidar'
import { buildIndexExhTsFile, createIndexExhTsFile } from './indexExhFile'

const iteration = async (
  includeGlobPatterns: string[],
) => {
  await createIndexExhTsFile(includeGlobPatterns)
  await buildIndexExhTsFile()
}

export const watchComponentLibrary = async (
  config: Config,
  configDir: string,
) => {
  const includeGlobPatterns = config.include
    // eslint-disable-next-line prefer-regex-literals
    .map(globPattern => path.join(configDir, globPattern).replace(new RegExp('\\\\', 'g'), '/'))

  await iteration(includeGlobPatterns)

  watch(() => {
    iteration(includeGlobPatterns).then(() => undefined).catch(() => undefined)
  }, config.watch, 150, () => {
    console.log('Watching for changes within:', config.watch, '...')
  })
}
