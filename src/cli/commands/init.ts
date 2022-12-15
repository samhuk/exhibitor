import { exec, ExecException, spawn } from 'child_process'
import * as fs from 'fs'
import readline from 'readline'
import { exit } from 'process'
import { CliError, printCliString, printError } from '../commandResult'
import { CliString } from '../types'
import { Config } from '../config/types'

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

const npmInstallPackage = (packageName: string, isDevDep: boolean = false) => new Promise<{ execError: ExecException } | null>((res, rej) => {
  exec(`npm i ${isDevDep ? '--save-dev' : '--save'} ${packageName}`, err => {
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
      if (errMsg == null) {
        options.onComplete(val)
      }
      else {
        printError({ message: errMsg })
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

const modifyPackageJsonFile = async (): Promise<CliError | null> => {
  const packageJson = fs.readFileSync('./package.json', { encoding: 'utf8' })
  let packageJsonObj: any
  try {
    packageJsonObj = JSON.parse(packageJson)
  }
  catch (e) {
    return createInitPackageJsonError(c => `${c.cyan('./package.json')} is invalid JSON. Error: ${e}`)
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
    return createInitPackageJsonError(`Could not write new package.json content to file. Error: ${e}`)
  }

  return null
}

const createExhConfigFile = async (): Promise<CliError | null> => {
  const doesExhConfigFileExist = fs.existsSync('./exh.config.json')

  let shouldWriteExhConfigFile: boolean = true

  if (doesExhConfigFileExist)
    shouldWriteExhConfigFile = await askBooleanQuestion('./exh.config.json file already exists. Should we overwrite it?', false)

  if (!shouldWriteExhConfigFile)
    return null

  const config = {
    $schema: 'https://raw.githubusercontent.com/samhuk/exhibitor/master/src/cli/config/schema.json',
  }
  try {
    fs.writeFileSync('./exh.config.json', JSON.stringify(config, null, 2))
  }
  catch (e) {
    return createInitPackageJsonError(`Could not create exh.config.json file. Error: ${e}`)
  }

  return null
}

const createExampleComponentCode = () => {
  if (!fs.existsSync('./src'))
    fs.mkdirSync('./src')
  if (!fs.existsSync('./src/button'))
    fs.mkdirSync('./src/button')
  const buttonComponentCode = `import React from 'react'
import './index.scss'

export const render = (props: {
  text: string
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  color?: 'default' | 'red' | 'yellow' | 'green' | 'blue'
}) => {
  const color = props.color ?? 'default'

  const onClick: React.MouseEventHandler<HTMLButtonElement> = e => {
    props.onClick(e)
  }

  return (
    <button
      className={\`cl-button color-\${color}\`}
      type="button"
      onClick={onClick}
    >
      {props.text}
    </button>
  )
}

export default render`
  fs.writeFileSync('./src/button/index.tsx', buttonComponentCode)

  const buttonComponentScssCode = `$background-color: #fff;
$border: 1px solid #ccc;
$border-radius: 5px;

.cl-button {
  background-color: $background-color;
  border: $border;
  border-radius: $border-radius;
  cursor: pointer;
  padding: 5px 10px;

  &:hover {
    background-color: darken($background-color, 10)
  }

  &.color-green {
    background-color: green;
    color: #fff;
  }

  &.color-yellow {
    background-color: yellow;
    color: #fff;
  }

  &.color-red {
    background-color: red;
    color: #fff;
  }
  
  &.color-blue {
    background-color: blue;
    color: #fff;
  }
}`
  fs.writeFileSync('./src/button/index.scss', buttonComponentScssCode)

  const buttonComponentExhibitCode = `import exhibit from 'exhibitor'
import Button from '.'

exhibit(Button, 'Button')
  .events({
    onClick: true,
  })
  .defaults({
    onClick: () => undefined,
    text: 'Button Text',
    color: 'default',
  })
  .variant('green', p => ({
    ...p,
    color: 'green',
  }))
  .variant('yellow', p => ({
    ...p,
    color: 'yellow',
  }))
  .variant('red', p => ({
    ...p,
    color: 'red',
  }))
  .variant('blue', p => ({
    ...p,
    color: 'blue',
  }))
  .build()`
  fs.writeFileSync('./src/button/index.exh.ts', buttonComponentExhibitCode)
}

export const init = async () => {
  printCliString(c => `${c.yellow('Warn: \'init\' command is currently in alpha')}`)
  // Ensure that package.json exists
  const doesPackageJsonFileExists = fs.existsSync('./package.json')
  if (!doesPackageJsonFileExists) {
    printError(createInitPackageJsonError(c => `${c.cyan('./package.json')} file does not exist. Run ${c.bold('npm init')}' first.`))
    exit(1)
  }

  printCliString(c => `${c.blue('⬤')} Modifying package.json file...`)
  // Modify package.json file, e.g. add "exh" npm script
  const modifyPackageJsonFileError = await modifyPackageJsonFile()
  if (modifyPackageJsonFileError != null) {
    printError(modifyPackageJsonFileError)
    exit(1)
  }

  printCliString(c => `${c.blue('⬤')} Installing typescript...`)
  // Install typescript, if not already
  const installTypescriptExecError = await npmInstallPackage('typescript')
  if (installTypescriptExecError != null) {
    printError(createInstallDependenciesError(`Could not npm install typescript - ${installTypescriptExecError.execError.message}`))
    const shouldContinue = await askShouldContinue()
    if (!shouldContinue)
      exit(1)
  }

  printCliString(c => `${c.blue('⬤')} Installing react...`)
  // Install react, if not already
  const installReactExecError = await npmInstallPackage('react')
  if (installReactExecError != null) {
    printError(createInstallDependenciesError(`Could not npm install react - ${installTypescriptExecError.execError.message}`))
    const shouldContinue = await askShouldContinue()
    if (!shouldContinue)
      exit(1)
  }

  printCliString(c => `${c.blue('⬤')} Installing @types/react...`)
  // Install react, if not already
  const installReactTypesExecError = await npmInstallPackage('@types/react', true)
  if (installReactTypesExecError != null) {
    printError(createInstallDependenciesError(`Could not npm install @types/react - ${installTypescriptExecError.execError.message}`))
    const shouldContinue = await askShouldContinue()
    if (!shouldContinue)
      exit(1)
  }

  printCliString(c => `${c.blue('⬤')} Creating Exhibitor config file...`)
  // Create exh.config.json file
  const createExhConfigFileError = await createExhConfigFile()
  if (createExhConfigFileError != null) {
    printError(createExhConfigFileError)
    exit(1)
  }

  printCliString(c => `${c.blue('⬤')} Creating example component code...`)
  createExampleComponentCode()

  printCliString(c => `${(c.bold as any).green('Done!')} - Run ${(c.bold as any).white('npm run exh')}`)

  exit(0)
  // const shouldStartExhibitor = await askBooleanQuestion('Would you like us to run the \'exh\' npm script?', true)
  // if (shouldStartExhibitor) {
  //   const exhProcess = spawn('npm run exh')
  //   exhProcess.stdout.on('data', data => {
  //     console.log(data.toString())
  //   })

  //   exhProcess.stderr.on('data', data => {
  //     console.log(data.toString())
  //   })

  //   exhProcess.on('exit', code => {
  //     console.log('child process exited with code ', code.toString())
  //   })
  // }
}
