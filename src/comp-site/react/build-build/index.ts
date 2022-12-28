import { build } from 'esbuild'
import { nodeExternalsPlugin } from 'esbuild-node-externals'

import { createBuilder, nativeNodeModulesPlugin } from '../../../common/esbuilder'
import { COMP_SITE_REACT_BUILD_ENTRYPOINT, COMP_SITE_REACT_BUILD_OUTFILE } from '../../../common/paths'

const _createBuilder = () => () => build({
  entryPoints: [COMP_SITE_REACT_BUILD_ENTRYPOINT],
  outfile: COMP_SITE_REACT_BUILD_OUTFILE,
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
}).then(result => ({ buildResult: result }))

export const buildCompSiteReactBuild = () => createBuilder('comp-site-react-build', true, _createBuilder())()
