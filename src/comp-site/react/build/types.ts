import { BuildStatusReporter } from '../../../common/building'
import { Config } from '../../../common/config/types'

export type BuildOptions = {
  skipPrebuild: boolean
  reactMajorVersion: number
  config: Config
  onIndexExhTsFileCreate?: (file: { includedFilePaths: string[] }) => void
  buildStatusReporter: BuildStatusReporter
  onFirstSuccessfulBuild?: () => void
}
