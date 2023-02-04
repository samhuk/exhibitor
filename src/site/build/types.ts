import { BuildResult } from 'esbuild'
import { BuildStatus, BuildStatusReporter } from '../../common/building'

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
  buildStatusReporter: BuildStatusReporter
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
