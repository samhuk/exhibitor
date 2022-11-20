import {
  buildClient as buildClientEsdar,
  buildServer as buildServerEsdar,
  watchClient as watchClientEsdar,
  watchServer as watchServerEsdar,
  ClientOptions,
  ServerOptions,
} from 'esdar'

const clientOptions: ClientOptions = {
  prod: process.env.NODE_ENV === 'production',
  entrypointFilePath: './src/site/client/main.tsx',
  faviconFilePath: './src/site/client/favicon.ico',
  indexHtmlFilePath: './src/site/client/index.html',
  outputDirPath: './build/site-client',
  outputJsFileName: 'out.js',
  watchedDirectoryPaths: ['./src/site/client', './src/site/common'],
}

const serverOptions: ServerOptions = {
  prod: process.env.NODE_ENV === 'production',
  entrypointFilePath: './src/site/server/index.ts',
  outputDirPath: './build/site-server',
  outputJsFileName: 'out.js',
  watchedDirectoryPaths: ['./src/site/server', './src/site/common'],
  debugPort: 5003,
  external: ['livereload-js', 'pg-native'],
}

export const buildClient = () => buildClientEsdar(clientOptions)

export const buildServer = () => buildServerEsdar(serverOptions)

export const watchClient = () => watchClientEsdar(clientOptions)

export const watchServer = () => watchServerEsdar(serverOptions)
