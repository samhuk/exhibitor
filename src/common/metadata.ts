import * as fs from 'fs'

import { META_DATA_FILE } from './paths'

export type MetaData = {
  includedFilePaths: string[]
}

export const getMetadata = (): MetaData => {
  const fileText = fs.readFileSync(META_DATA_FILE, { encoding: 'utf8' })
  return JSON.parse(fileText)
}
