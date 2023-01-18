import { Config } from '../../../common/config/types'

export type BuildOptions = {
  skipPrebuild: boolean
  reactMajorVersion: number
  config: Config
  onIndexExhTsFileCreate?: (file: { includedFilePaths: string[] }) => void
  onFirstSuccessfulBuildComplete?: () => void
  onSuccessfulBuildComplete?: () => void
}
