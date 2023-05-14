import { build as esbuildBuild, Plugin } from 'esbuild'
import * as fs from 'fs'
import path from 'path'
import sassPlugin from 'esbuild-sass-plugin'

import { build as _build } from '../../../common/esbuilder'
import { gzipLargeFiles } from '../../../common/gzip'
import { BuildOptions } from './types'
import { NPM_PACKAGE_NAME } from '../../../common/name'
import { createComponentLibraryIncluderPlugin } from '../../../cli/indexExhFile'
import { ExhEnv, getEnv, getIsDemo } from '../../../common/env'
import { createIndexHtmlFileText } from '../../../common/esbuildHtmlFilePlugin2'

const exhEnv = getEnv()
const isDev = exhEnv === ExhEnv.DEV
const isDemo = getIsDemo()

const getComponentSiteSubType = (
  reactMajorVersion: number,
) => (reactMajorVersion >= 18
  ? '18-or-more'
  : '17-or-less')

const getPaths = (options: BuildOptions) => {
  const type = 'react'
  const subType = getComponentSiteSubType(options.reactMajorVersion)

  const indexHtmlOutPath = path.relative(path.resolve('./'), path.resolve(options.compSiteOutDir, 'index.html'))
  const outFile = path.resolve(options.compSiteOutDir, 'index.js')

  // If skipPrebuild is true then we will build the comp site directly from the local typescript
  if (options.skipPrebuild) {
    return {
      entrypoint: `./src/comp-site/${type}/${subType}/index.tsx`,
      indexHtmlPath: `./src/comp-site/${type}/index.html`,
      indexHtmlOutPath,
      outFile,
    }
  }

  const prebuildsPath = exhEnv === ExhEnv.DEV || exhEnv === ExhEnv.DEV_REL
    ? './build/comp-site-prebuilds'
    : `./node_modules/${NPM_PACKAGE_NAME}/lib/comp-site-prebuilds`
  // E.g. comp-site/react/18-or-more/index.js
  const entrypointPathSuffix = `comp-site/${type}/${subType}/index.js`
  const indexHtmlPathSuffix = `${type}-index.html`

  return {
    entrypoint: `${prebuildsPath}/${entrypointPathSuffix}`,
    indexHtmlPath: `${prebuildsPath}/${indexHtmlPathSuffix}`,
    indexHtmlOutPath,
    outFile,
  }
}

const createBuilder = (options: BuildOptions) => {
  const paths = getPaths(options)

  return async () => esbuildBuild({
    // Overrideable build options
    loader: {
      '.ttf': 'file',
      '.woff': 'file',
      '.woff2': 'file',
    },
    // Apply custom build options
    ...options.config.esbuildOptions,
    // Merge custom plugins with mandatory built-in ones
    plugins: [
      sassPlugin() as unknown as Plugin,
      createComponentLibraryIncluderPlugin(options.config, options.indexExhOutDir, options.onIndexExhTsFileCreate),
      ...(options.config.esbuildOptions?.plugins ?? []),
    ],
    // Non-overrideable build options
    entryPoints: [paths.entrypoint],
    outfile: paths.outFile,
    bundle: true,
    minify: isDemo ? !isDev : false,
    sourcemap: true,
    metafile: true,
    incremental: true,
    // Silent mode still shows build errors, but just less verbose.
    logLevel: isDev ? undefined : 'silent',
  })
    .then(result => {
      // Doing path.dirname of the comp-site outdir such that extra esbuild outfiles end up with the path "/comp-site/{path}"
      const indexHtmlText = createIndexHtmlFileText(result, null, paths.indexHtmlPath, path.dirname(options.compSiteOutDir))
      // Copy over additional files to build output dir
      fs.writeFileSync(paths.indexHtmlOutPath, indexHtmlText)

      if (!isDev) {
        gzipLargeFiles(options.indexExhOutDir)
        if (options.compSiteOutDir !== options.indexExhOutDir)
          gzipLargeFiles(options.compSiteOutDir)
      }

      return {
        buildResult: result,
        additionalOutputs: [
          { path: paths.indexHtmlOutPath, sizeBytes: Buffer.from(indexHtmlText).length },
        ],
      }
    })
}

export const build = (options: BuildOptions) => _build('Component Site for React', options.config.verbose, createBuilder(options))
