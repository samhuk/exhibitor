import * as esbuild from 'esbuild'
import path from 'path'
import { stdout } from 'process'
import prettyBytes from './prettyBytes'

export type BuildOutput = {
  path: string
  sizeBytes: number
}

export type CustomBuildResult = { buildResult: esbuild.BuildResult, additionalOutputs?: BuildOutput[] }

const BUILD_VERBOSITY = process.env.BUILD_VERBOSITY != null ? parseInt(process.env.BUILD_VERBOSITY) : 1

/**
 * Prints the result of the given esbuild result to console.
 */
export const printBuildResult = (result: esbuild.BuildResult, startTime: number, additionalOutputs?: BuildOutput[]) => {
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
  if (BUILD_VERBOSITY > 0) {
    Object.entries(result.metafile.outputs).forEach(([filename, output]) => console.log(`    ${filename} [${prettyBytes(output.bytes)}]`))
    additionalOutputs?.forEach(o => console.log(`    ${path.relative(path.resolve('./'), o.path)} [${prettyBytes(o.sizeBytes)}]`))
  }
  // Metrics
  console.log('  Metrics:')
  if (BUILD_VERBOSITY > 0)
    console.log(`    Compression ratio: ${(totalInputFileSizeBytes / totalOutputFileSizeBytes).toFixed(2)}`)
  console.log(`    dt: ${(Date.now() - startTime)} ms`)
}

export const createBuilder = (buildName: string, builder: () => Promise<CustomBuildResult>): () => Promise<CustomBuildResult> => () => {
  stdout.write(`Building ${buildName}...`)
  const startTime = Date.now()
  return builder()
    .then(result => {
      stdout.write('Done.\n')
      printBuildResult(result.buildResult, startTime, result.additionalOutputs)
      return result
    })
    .catch(err => {
      console.log(err)
      return null
    })
}
