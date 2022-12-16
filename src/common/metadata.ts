import * as fs from 'fs'

import { META_DATA_FILE } from './paths'

export type MetaData = {
  includedFilePaths: string[]
  siteTitle: string
}

export const setMetadata = (
  metaData: MetaData,
): void => {
  fs.writeFileSync(META_DATA_FILE, JSON.stringify(metaData, null, 2))
}

export const getMetadata = (): MetaData => {
  const fileText = fs.readFileSync(META_DATA_FILE, { encoding: 'utf8' })
  return JSON.parse(fileText)
}
