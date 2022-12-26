import { BuildResult } from 'esbuild'

export type BuildOptions = {
  minify: boolean
  sourceMap: boolean
  incremental: boolean
  outDir: string
  gzip: boolean
  verbose: boolean
}

export type WatchClientOptions = BuildOptions & {
  watchedDirPatterns: string[]
}

export type BuildOutput = {
  path: string
  sizeBytes: number
}

export type CustomBuildResult = { buildResult: BuildResult, additionalOutputs?: BuildOutput[] }
