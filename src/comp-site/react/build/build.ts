import { build as _build, Plugin } from 'esbuild'
import sassPlugin from 'esbuild-sass-plugin'
import * as fs from 'fs'
import path from 'path'

import { createBuilder } from '../../../common/esbuilder'
import { COMP_SITE_REACT_ENTRYPOINT, COMP_SITE_REACT_HTML_PATH } from '../../../common/paths'
import { gzipLargeFiles } from '../../../common/gzip'
import { BuildClientOptions } from './types'

const createClientBuilder = (options: BuildClientOptions) => {
  const outputJsFilePath = path.resolve(options.outDir, 'index.js')
  const indexHtmlFileOutputPath = path.relative(path.resolve('./'), path.resolve(options.outDir, 'index.html'))

  return () => _build({
    entryPoints: [COMP_SITE_REACT_ENTRYPOINT],
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
    fs.copyFileSync(COMP_SITE_REACT_HTML_PATH, indexHtmlFileOutputPath)

    if (options.gzip)
      gzipLargeFiles(options.outDir)

    return {
      buildResult: result,
      additionalOutputs: [
        { path: indexHtmlFileOutputPath, sizeBytes: Buffer.from(fs.readFileSync(COMP_SITE_REACT_HTML_PATH, { encoding: 'utf8' })).length },
      ],
    }
  })
}

export const build = (options: BuildClientOptions) => createBuilder('comp-site-react', options.verbose, createClientBuilder(options))()
