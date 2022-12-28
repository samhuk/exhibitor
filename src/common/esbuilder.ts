import { BuildResult, Plugin } from 'esbuild'
import path from 'path'
import { logStep } from '../cli/logging'

import prettyBytes from './prettyBytes'
import { BuildOutput, CustomBuildResult } from './types'

export const nativeNodeModulesPlugin: Plugin = {
  name: 'native-node-modules',
  setup(_build) {
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

/**
 * Prints the result of the given esbuild result to console.
 */
export const printBuildResult = (result: BuildResult, startTime: number, additionalOutputs?: BuildOutput[]) => {
  const inputFileCount = Object.keys(result.metafile.inputs).length
  const totalInputFileSizeBytes = Object.values(result.metafile.inputs).reduce((acc, input) => acc + input.bytes, 0)
  const totalOutputFileSizeBytes = Object.values(result.metafile.outputs).reduce((acc, output) => acc + output.bytes, 0)
  const outputFileCount = Object.keys(result.metafile.outputs).length
  // Print input data
  console.log('  Inputs:')
  console.log(`    Input file count: ${inputFileCount} [${prettyBytes(totalInputFileSizeBytes)}]`)
  // Print output data
  console.log('  Outputs:')
  console.log(`    Output file count: ${outputFileCount} [${prettyBytes(totalOutputFileSizeBytes)}]`)
  Object.entries(result.metafile.outputs).forEach(([filename, output]) => console.log(`    ${filename} [${prettyBytes(output.bytes)}]`))
  additionalOutputs?.forEach(o => console.log(`    ${path.relative(path.resolve('./'), o.path)} [${prettyBytes(o.sizeBytes)}]`))
  // Metrics
  console.log('  Metrics:')
  console.log(`    dt: ${(Date.now() - startTime)} ms`)
  console.log(`    Compression ratio: ${(totalInputFileSizeBytes / totalOutputFileSizeBytes).toFixed(2)}`)
}

export const createBuilder = (
  buildName: string,
  verbose: boolean,
  builder: () => Promise<CustomBuildResult>,
): () => Promise<CustomBuildResult> => () => {
  logStep(`Building ${buildName}`)
  const startTime = Date.now()
  return builder()
    .then(result => {
      console.log('Done.')
      if (verbose)
        printBuildResult(result.buildResult, startTime, result.additionalOutputs)
      return result
    })
    .catch(err => {
      throw err
    })
}
