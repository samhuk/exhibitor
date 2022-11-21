import path from 'path'

import { TEST_COMPONENT_LIBRARY_ROOT_DIR } from '../../common/paths'
import { Config } from '../types'
import watch from './debouncedChokidar'
import { buildIndexExhTsFile, createIndexExhTsFile } from './indexExhFile'

const isTesting = process.env.IS_EXHIBITOR_TESTING === 'true'

const iteration = async (
  includeGlobPatterns: string[],
) => {
  await createIndexExhTsFile(includeGlobPatterns)
  await buildIndexExhTsFile()
}

export const watchComponentLibrary = async (
  config: Config,
) => {
  const includeGlobPatterns = isTesting
    // eslint-disable-next-line prefer-regex-literals
    ? config.include.map(globPattern => path.join(TEST_COMPONENT_LIBRARY_ROOT_DIR, globPattern).replace(new RegExp('\\\\', 'g'), '/'))
    : config.include

  await iteration(includeGlobPatterns)

  watch(() => {
    iteration(includeGlobPatterns).then(() => undefined).catch(() => undefined)
  }, includeGlobPatterns, 150, () => {
    console.log('Watching for changes...')
  })
}
