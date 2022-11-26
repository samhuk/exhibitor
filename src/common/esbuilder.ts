import { BuildResult } from 'esbuild'
import path from 'path'

import prettyBytes from './prettyBytes'
import { BuildOutput, CustomBuildResult } from './types'

/**
 * Prints the result of the given esbuild result to console.
 */
export const printBuildResult = (result: BuildResult, startTime: number, verbose: boolean, additionalOutputs?: BuildOutput[]) => {
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
  if (verbose) {
    Object.entries(result.metafile.outputs).forEach(([filename, output]) => console.log(`    ${filename} [${prettyBytes(output.bytes)}]`))
    additionalOutputs?.forEach(o => console.log(`    ${path.relative(path.resolve('./'), o.path)} [${prettyBytes(o.sizeBytes)}]`))
  }
  // Metrics
  console.log('  Metrics:')
  if (verbose)
    console.log(`    Compression ratio: ${(totalInputFileSizeBytes / totalOutputFileSizeBytes).toFixed(2)}`)
  console.log(`    dt: ${(Date.now() - startTime)} ms`)
}

export const createBuilder = (
  buildName: string,
  verbose: boolean,
  builder: () => Promise<CustomBuildResult>,
): () => Promise<CustomBuildResult> => () => {
  console.log(`Building ${buildName}...`)
  const startTime = Date.now()
  return builder()
    .then(result => {
      console.log('Done.')
      printBuildResult(result.buildResult, startTime, verbose, result.additionalOutputs)
      return result
    })
    .catch(err => {
      console.log(err)
      return null
    })
}
