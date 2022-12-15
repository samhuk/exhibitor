import { exec, ExecException } from 'child_process'
import * as fs from 'fs'
import readline from 'readline'
import { exit } from 'process'
import { CliError, printError } from './commandResult'
import { CliString } from './types'
import { Config } from './config/types'

const r1 = readline.createInterface({ input: process.stdin, output: process.stdout })

const capitalize = (s: string): string => `${s.charAt(0).toUpperCase()}${s.slice(1)}`

const dashCaseToCamelCase = (s: string): string => s.replace(/-([a-z0-9])/g, (_, m) => `${m.toUpperCase()}`)

type Validator<TValue extends any = any> = {
  op: (s: TValue) => boolean
  errMsg: string
}

const VALIDATORS = {
  isNonEmptyString: { op: (s: string) => s != null && s.length > 0, errMsg: 'Cannot be empty' },
  hasNoSpaces: { op: (s: string) => s.indexOf(' ') === -1, errMsg: 'Cannot have whitespace' },
} as const

const npmInstall = () => new Promise<void>((res, rej) => {
  exec('npm i', err => {
    if (err != null)
      console.log(err)
    else
      res()
  })
})

const npmInstallPackage = (packageName: string) => new Promise<{ execError: ExecException } | null>((res, rej) => {
  exec(`npm i -S ${packageName}`, err => {
    if (err != null)
      console.log({ execError: err })
    else
      res(null)
  })
})

const tryGetInput = (options: {
  question: string
  onComplete: (val: string) => void
  validators?: Validator<string>[]
  defaultIfEmpty: string
}) => {
  const _question = options.defaultIfEmpty != null ? `${options.question} [${options.defaultIfEmpty}]: ` : `${options.question}: `
  r1.question(_question, val => {
    const isEmpty = !VALIDATORS.isNonEmptyString.op(val)
    if (isEmpty && options.defaultIfEmpty != null) {
      options.onComplete(options.defaultIfEmpty)
      return
    }

    if (options.validators != null) {
      const errMsg = options.validators.find(validator => !validator.op(val))?.errMsg
      if (errMsg != null) {
        options.onComplete(val)
      }
      else {
        console.log(printError({ message: errMsg }))
        tryGetInput(options)
      }
    }
    else {
      options.onComplete(val)
    }
  })
}

const askBooleanQuestion = (
  question: string,
  defaultIfEmpty?: boolean,
) => new Promise<boolean>((res, rej) => {
  tryGetInput({
    question,
    defaultIfEmpty: defaultIfEmpty != null
      ? defaultIfEmpty
        ? 'Y'
        : 'N'
      : undefined,
    onComplete: v => {
      res(['y', 'Y'].indexOf(v[0]) !== -1)
    },
    validators: [{
      op: v => ['y', 'Y', 'n', 'N'].indexOf(v[0]) !== -1,
      errMsg: 'Invalid answer.',
    }],
  })
})

const askShouldContinue = (defaultIfEmpty: boolean = true) => askBooleanQuestion('Continue?', defaultIfEmpty)

const createInitPackageJsonError = (causedBy: CliString): CliError => ({
  message: 'Could not modify package.json for exhibitor use.',
  causedBy,
})

const createInstallDependenciesError = (causedBy: CliString): CliError => ({
  message: 'Could not install dependencies.',
  causedBy,
})

export const init = async () => {
  const doesPackageJsonFileExists = fs.existsSync('./package.json')
  if (!doesPackageJsonFileExists) {
    printError(createInitPackageJsonError(c => `${c.cyan('./package.json')} file does not exist. Run ${c.bold('npm init')}' first.`))
    exit(1)
  }

  const packageJson = fs.readFileSync('./package.json', { encoding: 'utf8' })
  let packageJsonObj: any
  try {
    packageJsonObj = JSON.parse(packageJson)
  }
  catch (e) {
    printError(createInitPackageJsonError(c => `${c.cyan('./package.json')} is invalid JSON. Error: ${e}`))
    exit(1)
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
    fs.writeFileSync('./package.json', JSON.stringify(packageJsonObj))
  }
  catch (e) {
    printError(createInitPackageJsonError(`Could not write new package.json content to file. Error: ${e}`))
    exit(1)
  }

  const installTypescriptExecError = await npmInstallPackage('typescript')
  if (installTypescriptExecError != null) {
    printError(createInstallDependenciesError(`Could not npm install typescript - ${installTypescriptExecError.execError.message}`))
    const shouldContinue = await askShouldContinue()
    if (!shouldContinue)
      exit(1)
  }

  const installReactExecError = await npmInstallPackage('react')
  if (installReactExecError != null) {
    printError(createInstallDependenciesError(`Could not npm install react - ${installTypescriptExecError.execError.message}`))
    const shouldContinue = await askShouldContinue()
    if (!shouldContinue)
      exit(1)
  }

  const doesExhConfigFileExist = fs.existsSync('./exh.config.json')

  let shouldWriteExhConfigFile: boolean = true

  if (doesExhConfigFileExist)
    shouldWriteExhConfigFile = await askBooleanQuestion('./exh.config.json file already exists. Should we overwrite it?')

  if (shouldWriteExhConfigFile) {
    const config = {
      $schema: 'https://raw.githubusercontent.com/samhuk/exhibitor/master/src/cli/config/schema.json',
    }
    try {
      fs.writeFileSync('./exh.config.json', JSON.stringify(config))
    }
    catch (e) {
      printError(createInitPackageJsonError(`Could not create exh.config.json file. Error: ${e}`))
      exit(1)
    }
  }
}
