import { build as _build } from 'esbuild'
import * as fs from 'fs'
import path from 'path'

import { createBuilder } from '../../../common/esbuilder'
import { gzipLargeFiles } from '../../../common/gzip'
import { BuildOptions } from './types'
import { NPM_PACKAGE_NAME } from '../../../common/name'

const isDev = process.env.EXH_DEV === 'true'

const createClientBuilder = (options: BuildOptions) => {
  const outputJsFilePath = path.resolve(options.outDir, 'index.js')
  const indexHtmlFileOutputPath = path.relative(path.resolve('./'), path.resolve(options.outDir, 'index.html'))

  const entrypoint = isDev ? './build/comp-site/react/site-prebuild/comp-site/react/site/main.js' : `./node_modules/${NPM_PACKAGE_NAME}/lib/comp-site/react/site-prebuild/comp-site/react/site/main.js`
  const htmlFilePath = isDev ? './build/comp-site/react/site-prebuild/index.html' : `./node_modules/${NPM_PACKAGE_NAME}/lib/comp-site/react/site-prebuild/index.html`

  return () => _build({
    entryPoints: [entrypoint],
    outfile: outputJsFilePath,
    bundle: true,
    minify: true,
    sourcemap: false,
    metafile: true,
    incremental: options.incremental,
  }).then(result => {
    // Copy over additional related files to build dir
    fs.copyFileSync(htmlFilePath, indexHtmlFileOutputPath)

    if (options.gzip)
      gzipLargeFiles(options.outDir)

    return {
      buildResult: result,
      additionalOutputs: [
        { path: indexHtmlFileOutputPath, sizeBytes: Buffer.from(fs.readFileSync(htmlFilePath, { encoding: 'utf8' })).length },
      ],
    }
  })
}

export const build = (options: BuildOptions) => createBuilder('comp-site-react', options.verbose, createClientBuilder(options))()
