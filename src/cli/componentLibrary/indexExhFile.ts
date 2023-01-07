import * as esbuild from 'esbuild'
import sassPlugin from 'esbuild-sass-plugin'
import * as fs from 'fs'
import glob from 'globsie'
import path from 'path'
import { pathToRegexp } from 'path-to-regexp'

import { createBuilder } from '../../common/esbuilder'
import { NPM_PACKAGE_NAME } from '../../common/name'
import { BUILD_OUTPUT_ROOT_DIR, BUNDLE_INPUT_FILE_NAME, BUNDLE_OUTPUT_FILE_NAME } from '../../common/paths'
import { ResolvedConfig } from '../config/types'
import { logStep, logWarn } from '../logging'

const isDev = process.env.EXH_DEV === 'true'

fs.mkdirSync(BUILD_OUTPUT_ROOT_DIR, { recursive: true })

const bundleInputFilePath = path.join(BUILD_OUTPUT_ROOT_DIR, BUNDLE_INPUT_FILE_NAME)
const bundleOutputFilePath = path.join(BUILD_OUTPUT_ROOT_DIR, BUNDLE_OUTPUT_FILE_NAME)

export const buildIndexExhTsFile = (config: ResolvedConfig, includedFilePaths: string[]) => {
  const exhFilesRegExp = new RegExp(includedFilePaths.map(p => pathToRegexp(p)).map(r => r.source).join('|'))
  return createBuilder('component library', config.verbose, () => esbuild.build({
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
    plugins: [
      sassPlugin() as unknown as esbuild.Plugin,
      {
        name: 'exhibitor',
        setup: build => {
          build.onResolve({ filter: exhFilesRegExp }, args => ({ path: args.path, namespace: 'exhibitor' }))
          build.onLoad({ filter: /.*/, namespace: 'exhibitor' }, args => ({
            contents: `window.exhibitSrcPath = '${args.path}'`,
          }))
        },
      },
    ],
    loader: {
      '.ttf': 'file',
      '.woff': 'file',
      '.woff2': 'file',
    },
    ...config.esbuildConfig,
  }).then(result => ({ buildResult: result })))
}

export const createIndexExhTsFile = async (
  configInclude: string[],
  rootStylePath?: string,
) => {
  logStep('Creating index.exh.ts file content.', true)
  logStep(c => `Determining included exhibit files. (using ${c.cyan(JSON.stringify(configInclude))}).`, true)
  const includedFilePaths = await glob(configInclude)
  if (includedFilePaths.length > 0)
    logStep(c => `Found ${c.cyan(includedFilePaths.length.toString())} exhibit files.`)
  else
    logWarn(c => `Did not find any exhibit files with the defined include (${c.cyan(JSON.stringify(configInclude))}).`)

  const exhibitApiFunctionPath = isDev
    // E.g. ../src/componentsBuild/exhibit
    ? path.relative(BUILD_OUTPUT_ROOT_DIR, './src/api/exhibit').replace(/\\/g, '/')
    // E.g. exhibitor/lib/api/exhibit
    : `${NPM_PACKAGE_NAME}/lib/api/api/exhibit`

  const _rootStylePath = rootStylePath != null
    ? path.relative(BUILD_OUTPUT_ROOT_DIR, rootStylePath).replace(/\\/g, '/')
    : null

  const text = [
    // import { resolve, __exhibits } from 'exhibitor/lib/api/api/exhibit' (in release)
    `import { resolve, __exhibits } from '${exhibitApiFunctionPath}'`,
    // E.g. import '../myComponentLibraryDir/styles.scss'
    _rootStylePath != null ? `import '${_rootStylePath}'` : null,
    // E.g. list of "export {} from '../myComponentLibraryDir/button.exh.ts'"
    includedFilePaths
      .map(_path => {
        const relativeImportPath = path.relative(BUILD_OUTPUT_ROOT_DIR, _path).replace(/\\/g, '/')

        return `export * from '${_path}'\nexport {} from '${relativeImportPath}'`
      })
      .join('\n'),
    'export const { nodes, pathTree } = resolve(__exhibits)',
    'export default __exhibits',
  ].filter(s => s != null).join('\n\n')

  fs.writeFileSync(bundleInputFilePath, text)

  return { includedFilePaths, text }
}
