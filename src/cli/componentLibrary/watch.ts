import path from 'path'
import watch from './debouncedChokidar'
import { buildIndexExhTsFile, createIndexExhTsFile } from '.'
import { Config } from '../types'
import { TEST_COMPONENT_LIBRARY_ROOT_DIR } from '../../common/paths'

const isTesting = process.env.IS_EXHIBITOR_TESTING === 'true'

const iteration = async (
  includeGlobPatterns: string[],
) => {
  await createIndexExhTsFile(includeGlobPatterns)
  console.log('==> Building index.exh.ts file...')
  await buildIndexExhTsFile()
}

export const watchComponentLibrary = async (
  config: Config,
) => {
  const includeGlobPatterns = isTesting
    ? config.include.map(globPattern => path.join(TEST_COMPONENT_LIBRARY_ROOT_DIR, globPattern))
    : config.include

  await iteration(includeGlobPatterns)

  console.log('==> Starting component library change watch...')
  watch(() => {
    console.log('Changes detected. Rebuilding...')
    iteration(includeGlobPatterns).then(() => undefined).catch(() => undefined)
  }, includeGlobPatterns, 150, () => {
    console.log('==> Watching for component library changes...')
  })
}
