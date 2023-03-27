import { BuildStatusReporter } from '../../../common/building'
import { Config } from '../../../common/config/types'

export type BuildOptions = {
  skipPrebuild: boolean
  reactMajorVersion: number
  config: Config
  onIndexExhTsFileCreate?: (file: { includedFilePaths: string[] }) => void
  buildStatusReporter?: BuildStatusReporter
  onFirstSuccessfulBuild?: () => void
  onBuildFail?: () => void
  /**
   * E.g. './.exh
   */
  serverRootDir: string
  /**
   * E.g. './.exh/comp-lib
   */
  indexExhOutDir: string
  /**
   * E.g. './.exh/comp-site
   */
  compSiteOutDir: string
}
