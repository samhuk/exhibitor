import { build as esbuildBuild, Plugin } from 'esbuild'
import sassPlugin from 'esbuild-sass-plugin'
import * as fs from 'fs'
import glob from 'globsie'
import path from 'path'
import { Config } from '../common/config/types'
import { getEnv, ExhEnv } from '../common/env'

import { createBuilder } from '../common/esbuilder'
import { logInfo, logStep, logWarn } from '../common/logging'
import { NPM_PACKAGE_NAME } from '../common/name'
import { BUILD_OUTPUT_ROOT_DIR, BUNDLE_INPUT_FILE_NAME, BUNDLE_OUTPUT_FILE_NAME } from '../common/paths'

const exhEnv = getEnv()
const isDev = exhEnv === ExhEnv.DEV

/**
 * esbuild plugin that includes the user's component library in a web browser javascript bundle.
 *
 * This plugin replaces all occurances of "import 'index.exh.ts" with the user's component library.
 */
export const srcPathPlugin: Plugin = ({
  name: 'src-path-plugin',
  setup: build => {
    /**
     * esbuild plugin that replaces all occurances of `import ... from '!exh{some path}'`
     * with `window.exhibitSrcPath = '{some path}'"`.
     *
     * This allows each call to the exhibit() function to be "tagged" with where it was called from.
     * The exhibit() function then references "window.exhibitSrcPath" to carry along that path
     * to the client, where it's used very extensively. A component variant in the client knowin
     * where it was defined in the source code unlocks a huge amount of functionality.
     */
    build.onResolve({ filter: /!exh/ }, args => ({ path: args.path, namespace: 'exhibit-src-path' }))
    build.onLoad({ filter: /.*/, namespace: 'exhibit-src-path' }, args => ({
      contents: `window.exhibitSrcPath = '${args.path.substring(4)}'`,
    }))
  },
})

fs.mkdirSync(BUILD_OUTPUT_ROOT_DIR, { recursive: true })

const createIndexExhTsFileBuilder = (
  config: Config,
  indexExhDir: string,
) => createBuilder(null, false, () => esbuildBuild({
  // Overrideable build options
  loader: {
    '.ttf': 'file',
    '.woff': 'file',
    '.woff2': 'file',
  },
  // Apply custom build options
  ...config.esbuildOptions,
  // Merge custom plugins with mandatory built-in ones
  plugins: [
    sassPlugin() as unknown as Plugin,
    srcPathPlugin,
    ...(config.esbuildOptions?.plugins ?? []),
  ],
  // Non-overrideable build options
  entryPoints: [path.join(indexExhDir, BUNDLE_INPUT_FILE_NAME)],
  outfile: path.join(indexExhDir, BUNDLE_OUTPUT_FILE_NAME),
  platform: 'browser',
  format: 'iife',
  globalName: 'exh',
  bundle: true,
  minify: !isDev,
  sourcemap: isDev,
  metafile: true,
  incremental: true,
}).then(result => ({ buildResult: result })))

const determineIncludedExhibitFiles = async (
  config: Config,
) => {
  logStep(c => `Determining included exhibit files. (using ${c.cyan(JSON.stringify(config.include))}).`, true)
  const includedFilePaths = await glob(config.include, { ignore: config.exclude })
  if (includedFilePaths.length > 0)
    logInfo(c => `Found ${c.cyan(includedFilePaths.length.toString())} exhibit files.`)
  else
    logWarn(c => `Did not find any exhibit files with the defined include (${c.cyan(JSON.stringify(config.include))}).`)

  return includedFilePaths
}

const createIndexExhTsFile = async (
  config: Config,
  outDir: string,
) => {
  logStep('Creating index.exh.ts file content.', true)
  const includedFilePaths = await determineIncludedExhibitFiles(config)

  const exhibitApiFunctionPath = exhEnv === ExhEnv.DEV || exhEnv === ExhEnv.DEV_REL
    // E.g. ../src/api/exhibit
    ? path.relative(outDir, './src/api/exhibit').replace(/\\/g, '/')
    // E.g. exhibitor/lib/api/exhibit
    : `${NPM_PACKAGE_NAME}/lib/api/api/exhibit`

  const textLines = [`import { resolve, __exhibits } from '${exhibitApiFunctionPath}'`]

  // TODO: Deprecated
  if (config.rootStyle != null)
    // E.g. import '../src/button/index.scss'
    textLines.push(`import '${path.relative(outDir, config.rootStyle).replace(/\\/g, '/')}'`)

  // -- Root styles
  if (config.rootStyles != null) {
    config.rootStyles.forEach(rootStyle => {
      // E.g. import '../src/button/index.scss'
      textLines.push(`import '${path.relative(outDir, rootStyle).replace(/\\/g, '/')}'`)
    })
  }

  // E.g.
  // import '!exhsrc/button/index.exh.ts'
  // export {} from '../src/button/index.exh.ts'
  textLines.push(includedFilePaths
    .map(_path => `import '!exh${_path}'\nexport {} from '${path.relative(outDir, _path).replace(/\\/g, '/')}'`)
    .join('\n'))

  textLines.push('window.exh = resolve(__exhibits)\nexport const { nodes, pathTree } = resolve(__exhibits)\nexport default __exhibits')

  const text = textLines.join('\n\n')

  const outPath = path.join(outDir, BUNDLE_INPUT_FILE_NAME)

  logStep(c => `Ensuring that ${c.cyan(outDir)} exists.`, true)
  if (!fs.existsSync(outDir))
    fs.mkdirSync(outDir, { recursive: true })

  logStep(c => `Writing index.exh.ts file content to ${c.cyan(outPath)}.`, true)
  fs.writeFileSync(outPath, text)

  return { includedFilePaths, text }
}

/**
 * esbuild plugin that includes the user's component library in a web browser javascript bundle.
 *
 * This plugin replaces all occurances of "import 'index.exh.ts" with the user's component library.
 */
export const createComponentLibraryIncluderPlugin = (
  config: Config,
  outDir: string,
  onIndexExhTsFileCreation?: (file: { includedFilePaths: string[], text: string }) => void,
): Plugin => ({
  name: 'index-exh-ts-includer',
  setup: build => {
    // Put the importation to "index.exh.ts" into the index-exh-ts namespace
    build.onResolve({ filter: /^index\.exh\.ts$/ }, args => ({
      path: args.path,
      namespace: 'index-exh-ts',
    }))

    const buildIndexExhTsFile = createIndexExhTsFileBuilder(config, outDir)
    /* For that importation to "index.exh.ts", replace it with importations of the user's
      * matched component exhibit files from their component library.
      */
    build.onLoad({ filter: /.*/, namespace: 'index-exh-ts' }, async () => {
      const indexExhTsFile = await createIndexExhTsFile(config, outDir)
      onIndexExhTsFileCreation?.(indexExhTsFile)
      await buildIndexExhTsFile()
      return {
        contents: indexExhTsFile.text,
        resolveDir: outDir,
        loader: 'tsx',
      }
    })
    // Add the exhibit srcPath plugin
    srcPathPlugin.setup(build)
  },
})
