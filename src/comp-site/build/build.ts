import { build as _build, Plugin } from 'esbuild'
import sassPlugin from 'esbuild-sass-plugin'
import * as fs from 'fs'
import path from 'path'

import { createBuilder } from '../../common/esbuilder'
import { COMPONENT_SITE_CLIENT_ENTRYPOINT, COMPONENT_SITE_CLIENT_HTML_PATH } from '../../common/paths'
import { gzipLargeFiles } from './gzip'
import { BuildClientOptions } from './types'

const createClientBuilder = (options: BuildClientOptions) => {
  const outputJsFilePath = path.resolve(options.outDir, 'index.js')
  const indexHtmlFileOutputPath = path.relative(path.resolve('./'), path.resolve(options.outDir, 'index.html'))

  return () => _build({
    entryPoints: [COMPONENT_SITE_CLIENT_ENTRYPOINT],
    outfile: outputJsFilePath,
    bundle: true,
    minify: options.minify,
    sourcemap: options.sourceMap,
    metafile: true,
    incremental: options.incremental,
    plugins: [sassPlugin() as unknown as Plugin],
    loader: {
      '.ttf': 'file',
      '.woff': 'file',
      '.woff2': 'file',
    },
  }).then(result => {
    // Copy over additional related files to build dir
    fs.copyFileSync(COMPONENT_SITE_CLIENT_HTML_PATH, indexHtmlFileOutputPath)

    if (options.gzip)
      gzipLargeFiles(options.outDir)

    return {
      buildResult: result,
      additionalOutputs: [
        { path: indexHtmlFileOutputPath, sizeBytes: Buffer.from(fs.readFileSync(COMPONENT_SITE_CLIENT_HTML_PATH, { encoding: 'utf8' })).length },
      ],
    }
  })
}

export const build = (options: BuildClientOptions) => createBuilder('component-site', options.verbose, createClientBuilder(options))()
