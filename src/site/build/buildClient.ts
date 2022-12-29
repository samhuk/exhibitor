import { build, Plugin } from 'esbuild'
import sassPlugin from 'esbuild-sass-plugin'
import * as fs from 'fs'
import path from 'path'

import { createBuilder } from '../../common/esbuilder'
import { SITE_CLIENT_ENTRYPOINT, SITE_CLIENT_FAVICON_PATH, SITE_CLIENT_HTML_PATH } from '../../common/paths'
import { createIndexHtmlFileText } from './esbuildHtmlFilePlugin'
import { gzipLargeFiles } from '../../common/gzip'
import { BuildClientOptions } from './types'

const createClientBuilder = (options: BuildClientOptions) => {
  const outputJsFilePath = path.resolve(options.outDir, 'index.js')
  const indexHtmlFileOutputPath = path.relative(path.resolve('./'), path.resolve(options.outDir, 'index.html'))
  const faviconFileOutputPath = path.relative(path.resolve('./'), path.resolve(options.outDir, 'favicon.ico'))

  return () => build({
    entryPoints: [SITE_CLIENT_ENTRYPOINT],
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
    external: [],
  }).then(result => {
    // Create index.html file, referencing build outputs
    const indexHtmlFileText = createIndexHtmlFileText(result, faviconFileOutputPath, SITE_CLIENT_HTML_PATH, options.outDir)
    // Copy over additional related files to build dir
    fs.writeFileSync(indexHtmlFileOutputPath, indexHtmlFileText)
    fs.copyFileSync(SITE_CLIENT_FAVICON_PATH, faviconFileOutputPath)

    if (options.gzip)
      gzipLargeFiles(options.outDir)

    return {
      buildResult: result,
      additionalOutputs: [
        { path: indexHtmlFileOutputPath, sizeBytes: Buffer.from(indexHtmlFileText).length },
        { path: faviconFileOutputPath, sizeBytes: fs.statSync(SITE_CLIENT_FAVICON_PATH).size },
      ],
    }
  })
}

export const buildClient = (options: BuildClientOptions) => createBuilder('client', options.verbose, createClientBuilder(options))()
