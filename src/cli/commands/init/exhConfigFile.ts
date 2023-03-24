import * as fs from 'fs'
import { createGFError, GFError } from 'good-flow'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../../common/name'
import { askBooleanQuestion } from '../../common/input'

const createError = (inner: GFError): GFError => createGFError({
  msg: `Could not create ${NPM_PACKAGE_CAPITALIZED_NAME} configuration file.`,
  inner,
})

export const createExhConfigFile = async (): Promise<GFError | null> => {
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
  catch (e: any) {
    return createError(createGFError({
      msg: c => `Could not write to ${c.cyan(writePath)}.`,
      inner: e,
    }))
  }

  return null
}
