import { build } from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'

import { createBuilder } from '../../common/esbuilder'
import { SITE_SERVER_ENTRYPOINT } from '../../common/paths'
import { BuildServerOptions } from './types'

const nativeNodeModulesPlugin = {
  name: 'native-node-modules',
  setup(_build: any) {
    // If a ".node" file is imported within a module in the "file" namespace, resolve
    // it to an absolute path and put it into the "node-file" virtual namespace.
    _build.onResolve({ filter: /\.node$/, namespace: 'file' }, (args: any) => ({
      path: require.resolve(args.path, { paths: [args.resolveDir] }),
      namespace: 'node-file',
    }))

    // Files in the "node-file" virtual namespace call "require()" on the
    // path from esbuild of the ".node" file in the output directory.
    _build.onLoad({ filter: /.*/, namespace: 'node-file' }, (args: any) => ({
      contents: `
        import path from ${JSON.stringify(args.path)}
        try { module.exports = require(path) }
        catch {}
      `,
    }))

    // If a ".node" file is imported within a module in the "node-file" namespace, put
    // it in the "file" namespace where esbuild's default loading behavior will handle
    // it. It is already an absolute path since we resolved it to one above.
    _build.onResolve({ filter: /\.node$/, namespace: 'node-file' }, (args: any) => ({
      path: args.path,
      namespace: 'file',
    }))

    // Tell esbuild's default loading behavior to use the "file" loader for
    // these ".node" files.
    const opts = _build.initialOptions
    opts.loader = opts.loader || {}
    opts.loader['.node'] = 'file'
  },
}

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
