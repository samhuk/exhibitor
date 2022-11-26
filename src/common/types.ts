import { BuildResult } from 'esbuild'

export type BuildOutput = {
  path: string
  sizeBytes: number
}

export type CustomBuildResult = { buildResult: BuildResult, additionalOutputs?: BuildOutput[] }
