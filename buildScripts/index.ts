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
  entrypointFilePath: './src/client/main.tsx',
  faviconFilePath: './src/client/favicon.ico',
  indexHtmlFilePath: './src/client/index.html',
  outputDirPath: './build/client',
  outputJsFileName: 'out.js',
  watchedDirectoryPaths: ['./src/client', './src/common'],
}

const serverOptions: ServerOptions = {
  prod: process.env.NODE_ENV === 'production',
  entrypointFilePath: './src/server/index.ts',
  outputDirPath: './build/server',
  outputJsFileName: 'out.js',
  watchedDirectoryPaths: ['./src/server', './src/common'],
  debugPort: 5003,
  external: ['livereload-js', 'pg-native'],
}

export const buildClient = () => buildClientEsdar(clientOptions)

export const buildServer = () => buildServerEsdar(serverOptions)

export const watchClient = () => watchClientEsdar(clientOptions)

export const watchServer = () => watchServerEsdar(serverOptions)
