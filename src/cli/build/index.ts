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
      /* pako package breaks the CLI when kept as external. If it is, it's import
       * statement gets converted into "require(...pako.esm.mjs)", which then
       * causes an ERR_REQUIRE_ESM error.
       */
      allowList: ['pako'],
    }),
  ],
}).then(result => ({ buildResult: result }))

export const buildCli = () => createBuilder('cli', true, createCliBuilder())()
