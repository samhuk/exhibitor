import { build } from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'

import { createBuilder, nativeNodeModulesPlugin } from '../../common/esbuilder'

const createCliBuilder = () => () => build({
  entryPoints: ['./src/cli/index.ts'],
  outfile: './build/cli/cli/index.js',
  bundle: true,
  minify: true,
  sourcemap: false,
  metafile: true,
  incremental: false,
  format: 'cjs',
  platform: 'node',
  plugins: [
    nativeNodeModulesPlugin,
    nodeExternalsPlugin({
      packagePath: './dist/npm/exhibitor/package.json',
    }),
  ],
  external: ['./node_modules/*'],
}).then(result => ({ buildResult: result }))

export const buildCli = () => createBuilder('cli', true, createCliBuilder())()
