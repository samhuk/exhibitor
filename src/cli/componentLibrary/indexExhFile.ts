import * as esbuild from 'esbuild'
import sassPlugin from 'esbuild-sass-plugin'
import * as fs from 'fs'
import glob from 'globsie'
import path from 'path'

import { createBuilder } from '../../common/esbuilder'
import { NPM_PACKAGE_NAME } from '../../common/name'
import { BUILD_OUTPUT_ROOT_DIR, BUNDLE_INPUT_FILE_NAME, BUNDLE_OUTPUT_FILE_NAME } from '../../common/paths'

const isDev = process.env.EXH_DEV === 'true'

fs.mkdirSync(BUILD_OUTPUT_ROOT_DIR, { recursive: true })

const bundleInputFilePath = path.join(BUILD_OUTPUT_ROOT_DIR, BUNDLE_INPUT_FILE_NAME)
const bundleOutputFilePath = path.join(BUILD_OUTPUT_ROOT_DIR, BUNDLE_OUTPUT_FILE_NAME)

export const buildIndexExhTsFile = createBuilder('component library', true, () => esbuild.build({
  entryPoints: [bundleInputFilePath],
  outfile: bundleOutputFilePath,
  platform: 'browser',
  format: 'iife',
  globalName: 'exh',
  bundle: true,
  minify: !isDev,
  sourcemap: isDev,
  metafile: true,
  incremental: true,
  plugins: [sassPlugin() as unknown as esbuild.Plugin],
  loader: {
    '.ttf': 'file',
    '.woff': 'file',
    '.woff2': 'file',
  },
}).then(result => ({ buildResult: result })))

export const createIndexExhTsFile = async (
  configInclude: string[],
  rootStylePath?: string,
) => {
  const includedFilePaths = await glob(configInclude)

  // Path from '.exh' dir to the path '../exhibit' relative to this file,
  const exhibitApiFunctionPath = isDev
    // E.g. ../src/componentsBuild/exhibit
    ? path.relative(BUILD_OUTPUT_ROOT_DIR, './src/api/exhibit').replace(/\\/g, '/')
    // E.g. exhibitor/lib/api/exhibit
    : `${NPM_PACKAGE_NAME}/lib/api/exhibit`

  const _rootStylePath = rootStylePath != null
    ? path.relative(BUILD_OUTPUT_ROOT_DIR, rootStylePath).replace(/\\/g, '/')
    : null

  const text = [
    // E.g. import { exhibit } from '../../../node_modules/exhibitor' (in release)
    `import { resolve, __exhibits } from '${exhibitApiFunctionPath}'`,
    // E.g. import '../myComponentLibraryDir/styles.scss'
    _rootStylePath != null ? `import '${_rootStylePath}'` : null,
    // E.g. list of "export {} from '../myComponentLibraryDir/button.exh.ts'"
    includedFilePaths
      .map(_path => `export {} from '${path.relative(BUILD_OUTPUT_ROOT_DIR, _path).replace(/\\/g, '/')}'`)
      .join('\n'),
    'export const nodes = resolve(__exhibits)',
    'export default __exhibits',
  ].filter(s => s != null).join('\n\n')

  fs.writeFileSync(bundleInputFilePath, text)

  return { includedFilePaths, text }
}
