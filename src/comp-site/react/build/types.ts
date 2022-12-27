import { BuildResult } from 'esbuild'

export type BuildOptions = {
  sourceMap: boolean
  incremental: boolean
  gzip: boolean
  verbose: boolean
  skipPrebuild: boolean
}

export type BuildOutput = {
  path: string
  sizeBytes: number
}

export type CustomBuildResult = { buildResult: BuildResult, additionalOutputs?: BuildOutput[] }
