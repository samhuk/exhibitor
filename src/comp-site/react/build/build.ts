import { build as esbuildBuild, Plugin } from 'esbuild'
import * as fs from 'fs'
import path from 'path'
import sassPlugin from 'esbuild-sass-plugin'

import { build as _build } from '../../../common/esbuilder'
import { gzipLargeFiles } from '../../../common/gzip'
import { BuildOptions } from './types'
import { NPM_PACKAGE_NAME } from '../../../common/name'
import { COMP_SITE_OUTDIR } from '../../../common/paths'

import { createComponentLibraryIncluderPlugin } from '../../../cli/indexExhFile'
import { ExhEnv, getEnv } from '../../../common/env'

const exhEnv = getEnv()
const isDev = exhEnv === ExhEnv.DEV

const getComponentSiteSubType = (
  reactMajorVersion: number,
) => (reactMajorVersion >= 18
  ? '18-or-more'
  : '17-or-less')

const getPaths = (options: BuildOptions) => {
  const type = 'react'
  const subType = getComponentSiteSubType(options.reactMajorVersion)

  const indexHtmlOutPath = path.relative(path.resolve('./'), path.resolve(COMP_SITE_OUTDIR, 'index.html'))
  const outFile = path.resolve(COMP_SITE_OUTDIR, 'index.js')

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
      createComponentLibraryIncluderPlugin(options.config, options.onIndexExhTsFileCreate),
      ...(options.config.esbuildOptions?.plugins ?? []),
    ],
    // Non-overrideable build options
    entryPoints: [paths.entrypoint],
    outfile: paths.outFile,
    bundle: true,
    minify: !isDev,
    sourcemap: isDev,
    metafile: true,
    incremental: true,
  }).then(result => {
    // Copy over additional files to build output dir
    fs.copyFileSync(paths.indexHtmlPath, paths.indexHtmlOutPath)

    if (!isDev)
      gzipLargeFiles(COMP_SITE_OUTDIR)

    return {
      buildResult: result,
      additionalOutputs: [
        { path: paths.indexHtmlOutPath, sizeBytes: Buffer.from(fs.readFileSync(paths.indexHtmlPath, { encoding: 'utf8' })).length },
      ],
    }
  })
}

export const build = (options: BuildOptions) => _build('Component Site for React', options.config.verbose, createBuilder(options))
