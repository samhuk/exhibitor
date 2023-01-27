import { Request, Response } from 'express'
import * as fs from 'fs'
import { createExhError } from '../../../common/exhError'
import { ExhError } from '../../../common/exhError/types'
import { META_DATA_FILE } from '../../../common/paths'
import { sendResponse } from '../common/responses'

const getMetaDataJson = (): string | ExhError => {
  if (!fs.existsSync(META_DATA_FILE)) {
    return createExhError({
      message: 'Could not get Exhibitor metadata.',
      causedBy: c => `Metadata file at ${c.cyan(META_DATA_FILE)} does not exist.`,
      log: true,
    })
  }

  try {
    return fs.readFileSync(META_DATA_FILE, { encoding: 'utf8' })
  }
  catch (e: any) {
    return createExhError({
      message: 'Could not get Exhibitor metadata.',
      causedBy: c => `Failed to read metadata file at ${c.cyan(META_DATA_FILE)}.`,
      inner: e,
      log: true,
    })
  }
}

export const handleGetMetaData = (req: Request, res: Response) => {
  const result = getMetaDataJson()
  sendResponse(res, result)
}
