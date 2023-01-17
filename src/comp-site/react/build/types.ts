import { Config } from '../../../common/config/types'

export type BuildOptions = {
  sourceMap: boolean
  gzip: boolean
  verbose: boolean
  skipPrebuild: boolean
  reactMajorVersion: number
  config: Config
  onIndexExhTsFileCreate?: (file: { includedFilePaths: string[] }) => void
}
