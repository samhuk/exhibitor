import { build as _build } from 'esbuild'
import * as fs from 'fs'
import path from 'path'

import { createBuilder } from '../../../common/esbuilder'
import { gzipLargeFiles } from '../../../common/gzip'
import { BuildOptions } from './types'
import { NPM_PACKAGE_NAME } from '../../../common/name'
import { COMP_SITE_OUTDIR } from '../../../common/paths'

const isDev = process.env.EXH_DEV === 'true'

const getPaths = (options: BuildOptions) => {
  if (options.skipPrebuild) {
    return {
      entrypoint: './src/comp-site/react/site/main.tsx',
      htmlFilePath: './src/comp-site/react/site/index.html',
    }
  }

  const COMP_SITE_REACT_SITE_PREBUILD_OUTDIR = './build/comp-site/react/site-prebuild'

  const compSiteSuffix = options.reactMajorVersion < 18 ? '-sub18' : ''
  const compSiteSuffix2 = options.reactMajorVersion < 18 ? 'sub18' : ''
  return {
    entrypoint: isDev
      ? `${COMP_SITE_REACT_SITE_PREBUILD_OUTDIR}/comp-site/react/site/main.js`
      : `./node_modules/${NPM_PACKAGE_NAME}/lib/comp-site/react/site${compSiteSuffix}-prebuild/comp-site/react/site${compSiteSuffix2}/main.js`,
    htmlFilePath: isDev
      ? `${COMP_SITE_REACT_SITE_PREBUILD_OUTDIR}/index.html`
      : `./node_modules/${NPM_PACKAGE_NAME}/lib/comp-site/react/site${compSiteSuffix}-prebuild/index.html`,
  }
}

const createClientBuilder = (options: BuildOptions) => {
  const outputJsFilePath = path.resolve(COMP_SITE_OUTDIR, 'index.js')
  const indexHtmlFileOutputPath = path.relative(path.resolve('./'), path.resolve(COMP_SITE_OUTDIR, 'index.html'))

  const paths = getPaths(options)

  return () => _build({
    entryPoints: [paths.entrypoint],
    outfile: outputJsFilePath,
    bundle: true,
    minify: true,
    sourcemap: options.sourceMap,
    metafile: true,
    incremental: options.incremental,
  }).then(result => {
    // Copy over additional related files to build dir
    fs.copyFileSync(paths.htmlFilePath, indexHtmlFileOutputPath)

    if (options.gzip)
      gzipLargeFiles(COMP_SITE_OUTDIR)

    return {
      buildResult: result,
      additionalOutputs: [
        { path: indexHtmlFileOutputPath, sizeBytes: Buffer.from(fs.readFileSync(paths.htmlFilePath, { encoding: 'utf8' })).length },
      ],
    }
  })
}

export const build = (options: BuildOptions) => createBuilder('comp-site (React)', options.verbose, createClientBuilder(options))()
