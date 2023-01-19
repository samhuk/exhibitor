import { BuildResult, Plugin } from 'esbuild'
import path from 'path'
import { log, logStep, logSuccess } from '../cli/logging'

import prettyBytes from './prettyBytes'
import { BuildOutput, CustomBuildResult } from './types'

/**
 * esbuild plugin that makes doing `import path from 'path'` and `import * as fs from 'fs'` possible.
 */
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
  const dtMs = Date.now() - startTime
  // Print input data
  log(c => `  ${c.underline('Inputs:')}`)
  log(c => `    Count: ${c.bold(inputFileCount.toString())}  ${(c.yellow as any).bold(prettyBytes(totalInputFileSizeBytes))}`)
  // Print output data
  log(c => `  ${c.underline('Outputs:')}`)
  log(c => `    Count: ${c.bold(outputFileCount.toString())}  ${(c.yellow as any).bold(prettyBytes(totalOutputFileSizeBytes))}`)
  Object.entries(result.metafile.outputs).forEach(([filename, o]) => log(c => `    ${c.cyan(filename)}  ${c.yellow(prettyBytes(o.bytes))}`))
  additionalOutputs?.forEach(o => log(c => `    ${c.cyan(path.relative(path.resolve('./'), o.path))}  ${c.yellow(prettyBytes(o.sizeBytes))}`))
  // Metrics
  log(c => `  ${c.underline('Metrics:')}`)
  log(c => `    dt: ${c.bold(`${dtMs} ms`)}`)
  log(`    Compression ratio: ${(totalInputFileSizeBytes / totalOutputFileSizeBytes).toFixed(2)}`)
}

export const createBuilder = (
  buildName: string,
  verbose: boolean,
  builder: () => Promise<CustomBuildResult>,
): () => Promise<CustomBuildResult> => () => {
  if (buildName != null)
    logStep(`Building ${buildName}`)
  const startTime = Date.now()
  return builder()
    .then(result => {
      if (verbose) {
        logSuccess('Done. Results:')
        printBuildResult(result.buildResult, startTime, result.additionalOutputs)
      }
      return result
    })
    .catch(err => {
      throw err
    })
}

export const build = (
  buildName: string | null,
  verbose: boolean,
  builder: () => Promise<CustomBuildResult>,
): Promise<CustomBuildResult> => {
  if (buildName != null)
    logStep(`Building ${buildName}`)
  const startTime = Date.now()
  return builder()
    .then(result => {
      if (verbose) {
        logSuccess('Done. Results:')
        printBuildResult(result.buildResult, startTime, result.additionalOutputs)
      }
      return result
    })
    .catch(err => {
      throw err
    })
}
