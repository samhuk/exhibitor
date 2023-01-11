import { build } from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'

import { createBuilder, nativeNodeModulesPlugin } from '../../common/esbuilder'
import { SITE_SERVER_ENTRYPOINT } from '../../common/paths'
import { BuildServerOptions } from './types'

const createServerBuilder = (options: BuildServerOptions) => () => build({
  entryPoints: [SITE_SERVER_ENTRYPOINT],
  outfile: options.outfile,
  bundle: true,
  minify: options.minify,
  sourcemap: options.sourceMap,
  metafile: true,
  incremental: options.incremental,
  platform: 'node',
  external: ['livereload-js', 'playwright-core/cli'],
  plugins: [
    nativeNodeModulesPlugin,
    nodeExternalsPlugin({
      packagePath: './dist/npm/exhibitor/package.json',
      /* pako package breaks the CLI when kept as external. If it is, it's import
       * statement gets converted into "require(...pako.esm.mjs)", which then
       * causes an ERR_REQUIRE_ESM error.
       */
      allowList: ['pako'],
    }),
  ],
}).then(result => ({ buildResult: result }))

export const buildServer = (options: BuildServerOptions) => createBuilder('server', options.verbose, createServerBuilder(options))()
