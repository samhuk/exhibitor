import * as fs from 'fs'
import { createExhError } from '../../../common/exhError'
import { ExhError } from '../../../common/exhError/types'
import { ExhString } from '../../../common/exhString/types'
import { askBooleanQuestion } from '../../common/input'

const createError = (causedBy: ExhString): ExhError => createExhError({
  message: 'Could not create Exhibitor configuration file \'exh.config.json\'.',
  causedBy,
})

export const createExhConfigFile = async (): Promise<ExhError | null> => {
  const writePath = './exh.config.json'

  const doesExhConfigFileExist = fs.existsSync(writePath)

  let shouldWriteExhConfigFile: boolean = true

  if (doesExhConfigFileExist)
    shouldWriteExhConfigFile = await askBooleanQuestion(`${writePath} file already exists. Should we overwrite it?`, false)

  if (!shouldWriteExhConfigFile)
    return null

  const config = {
    $schema: 'https://raw.githubusercontent.com/samhuk/exhibitor/master/src/common/config/schema.json',
  }
  try {
    fs.writeFileSync(writePath, JSON.stringify(config, null, 2))
  }
  catch (e) {
    return createError(`Could not write to ${writePath}. Error: ${e}`)
  }

  return null
}
