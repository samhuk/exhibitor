import * as fs from 'fs'
import { ExhEnv } from './env'

import { META_DATA_FILE } from './paths'

export type MetaData = {
  includedFilePaths: string[]
  siteTitle: string
  isAxeEnabled: boolean
  intercom?: {
    host: string
    port: number
    enableLogging: boolean
  }
  env: ExhEnv
  isDemoMode: boolean
}

export const setMetadata = (
  metaData: MetaData,
  writePath: string,
): void => {
  fs.writeFileSync(writePath, JSON.stringify(metaData, null, 2))
}

export const getMetadata = (): MetaData => {
  const fileText = fs.readFileSync(META_DATA_FILE, { encoding: 'utf8' })
  return JSON.parse(fileText)
}
