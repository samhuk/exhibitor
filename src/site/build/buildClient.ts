import { build, Plugin } from 'esbuild'
import sassPlugin from 'esbuild-sass-plugin'
import * as fs from 'fs'
import path from 'path'

import { THEMES } from '../../common/theme'
import { createBuilder } from '../../common/esbuilder'
import { SITE_CLIENT_ENTRYPOINT, SITE_CLIENT_FAVICON_PATH, SITE_CLIENT_HTML_PATH } from '../../common/paths'
import { createIndexHtmlFileText } from './esbuildHtmlFilePlugin'
import { gzipLargeFiles } from '../../common/gzip'
import { BuildClientOptions } from './types'

const createClientBuilder = (options: BuildClientOptions) => {
  const indexHtmlFileOutputPath = path.relative(path.resolve('./'), path.resolve(options.outDir, 'index.html'))
  const faviconFileOutputPath = path.relative(path.resolve('./'), path.resolve(options.outDir, 'favicon.ico'))

  // Temporary workaround for https://github.com/TexteaInc/json-viewer/issues/133
  let content = fs.readFileSync('./node_modules/@textea/json-viewer/dist/index.mjs', { encoding: 'utf8' })
  let newContent = content
    .replace('import { DevelopmentError } from \'@textea/dev-kit/utils\';', '')
    .replace('DevelopmentError', 'Error')
  fs.writeFileSync('./node_modules/@textea/json-viewer/dist/index.mjs', newContent, { encoding: 'utf8' })

  content = fs.readFileSync('./node_modules/@textea/json-viewer/dist/index.js', { encoding: 'utf8' })
  newContent = content
    .replace(' require(\'@textea/dev-kit/utils\'),', '')
    .replace(' \'@textea/dev-kit/utils\',', '')
    .replace(' global["@textea/dev-kit/utils"],', '')
    .replace('DevelopmentError', 'Error')
  fs.writeFileSync('./node_modules/@textea/json-viewer/dist/index.js', newContent, { encoding: 'utf8' })

  // Define base entrypoints
  const entryPoints: { [name: string]: string } = {
    index: SITE_CLIENT_ENTRYPOINT,
    fa: './src/site/client/assets/styles/fa.scss',
  }
  // Add themes
  THEMES.forEach(t => entryPoints[t] = `./src/site/client/assets/styles/index-${t}.scss`)

  return () => build({
    entryPoints,
    outdir: options.outDir,
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
