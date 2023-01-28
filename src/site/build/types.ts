import { BuildResult } from 'esbuild'

export type BuildClientOptions = {
  minify: boolean
  sourceMap: boolean
  incremental: boolean
  outDir: string
  gzip: boolean
  verbose: boolean
}

export type BuildServerOptions = {
  minify: boolean
  sourceMap: boolean
  incremental: boolean
  outfile: string
  verbose: boolean
}

export type WatchClientOptions = BuildClientOptions & {
  watchedDirPatterns: string[]
  onSuccessfulBuildComplete?: () => void
}

export type WatchServerOptions = BuildServerOptions & {
  serverHost: string
  serverPort: number
  watchedDirPatterns: string[]
}

export type BuildOutput = {
  path: string
  sizeBytes: number
}

export type CustomBuildResult = { buildResult: BuildResult, additionalOutputs?: BuildOutput[] }
