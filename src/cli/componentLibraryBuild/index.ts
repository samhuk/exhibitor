import path from 'path'
import * as fs from 'fs'
import * as esbuild from 'esbuild'
import sassPlugin from 'esbuild-sass-plugin'
import glob from 'globsie'
import { BUILD_OUTPUT_ROOT_DIR, BUNDLE_INPUT_FILE_NAME, BUNDLE_OUTPUT_FILE_NAME } from '../../common/paths'
import { createBuilder } from './buildUtils'
import { NPM_PACKAGE_NAME } from '../../common/name'

const prod = process.env.NODE_ENV === 'production'
const isTesting = process.env.IS_EXHIBITOR_TESTING === 'true'

fs.mkdirSync(BUILD_OUTPUT_ROOT_DIR, { recursive: true })

const bundleInputFilePath = path.join(BUILD_OUTPUT_ROOT_DIR, BUNDLE_INPUT_FILE_NAME)
const bundleOutputFilePath = path.join(BUILD_OUTPUT_ROOT_DIR, BUNDLE_OUTPUT_FILE_NAME)

export const buildIndexExhTsFile = createBuilder('bundleInputBuilder', () => esbuild.build({
  entryPoints: [bundleInputFilePath],
  outfile: bundleOutputFilePath,
  platform: 'browser',
  format: 'iife',
  globalName: 'exh',
  bundle: true,
  minify: prod,
  sourcemap: !prod,
  metafile: true,
  incremental: !prod,
  plugins: [sassPlugin() as unknown as esbuild.Plugin],
  loader: {
    '.ttf': 'file',
    '.woff': 'file',
    '.woff2': 'file',
  },
}).then(result => ({ buildResult: result })))

export const createIndexExhTsFile = async (
  configInclude: string[],
) => {
  console.log('==> Creating index.exh.ts file...')
  console.log('--> Determining included component exhibit files')
  const includedFilePaths = await glob(configInclude)
  console.log('--> Found files:')
  console.log(includedFilePaths)

  // Path from '.exh' dir to the path '../exhibit' relative to this file,
  // E.g. ../../../node_modules/exhibitor (in production)
  // E.g. ./src/componentsBuild/exhibit
  const exhibitApiFunctionPath = isTesting
    ? path.relative(BUILD_OUTPUT_ROOT_DIR, './src/api/exhibit')
    : NPM_PACKAGE_NAME

  const text = [
    // E.g. import { exhibit } from '../../../node_modules/exhibitor' (in production)
    `import { __exhibits } from '${exhibitApiFunctionPath}'`,
    // E.g. list of "export {} from '../myComponentLibraryDir/button.exh.ts'"
    includedFilePaths
      .map(_path => `export {} from '${path.relative(BUILD_OUTPUT_ROOT_DIR, _path)}'`)
      .join('\n'),
    'export default __exhibits',
  ].join('\n\n')

  console.log('--> Writing components index.exh.ts file')
  fs.writeFileSync(bundleInputFilePath, text)
}
