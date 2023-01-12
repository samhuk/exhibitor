import * as fs from 'fs'
import { askBooleanQuestion } from '../../common/input'
import { logStep } from '../../logging'
import { CliError, CliString } from '../../types'

const createError = (causedBy: CliString): CliError => ({
  message: 'Could not modify package.json for exhibitor use.',
  causedBy,
})

const modifyPackageJsonFile = async (): Promise<CliError | null> => {
  const packageJson = fs.readFileSync('./package.json', { encoding: 'utf8' })
  let packageJsonObj: any
  try {
    packageJsonObj = JSON.parse(packageJson)
  }
  catch (e) {
    return createError(c => `${c.cyan('./package.json')} is invalid JSON. Error: ${e}`)
  }

  if (packageJsonObj.scripts == null)
    packageJsonObj.scripts = {}

  let shouldPopulateExhNpmScript: boolean = false
  if (packageJsonObj.scripts.exh != null)
    shouldPopulateExhNpmScript = await askBooleanQuestion('npm script \'exh\' already exists. Should we overwrite it?', false)
  else
    shouldPopulateExhNpmScript = true

  if (shouldPopulateExhNpmScript)
    packageJsonObj.scripts.exh = 'exhibitor start -c ./exh.config.json'

  try {
    fs.writeFileSync('./package.json', JSON.stringify(packageJsonObj, null, 2))
  }
  catch (e) {
    return createError(`Could not write new package.json content to file. Error: ${e}`)
  }

  return null
}

export const initPackageJson = async (): Promise<CliError | null> => {
  // Ensure that package.json exists
  const doesPackageJsonFileExists = fs.existsSync('./package.json')
  if (!doesPackageJsonFileExists)
    return createError(c => `${c.cyan('./package.json')} file does not exist. Run ${c.cyan('npm init -y')}' first.`)

  // Modify package.json file, e.g. add "exh" npm script
  logStep('Modifying package.json file')
  return modifyPackageJsonFile()
}
