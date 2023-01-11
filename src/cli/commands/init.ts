import * as fs from 'fs'
import readline from 'readline'
import { exit } from 'process'
import { CliError, CliString } from '../types'
import { baseCommand } from './common'
import { logError, logStep, logSuccess, logWarn } from '../logging'
import { npmInstallPackage } from '../../common/npm'

const r1 = readline.createInterface({ input: process.stdin, output: process.stdout })

type Validator<TValue extends any = any> = {
  op: (s: TValue) => boolean
  errMsg: string
}

const VALIDATORS = {
  isNonEmptyString: { op: (s: string) => s != null && s.length > 0, errMsg: 'Cannot be empty' },
  hasNoSpaces: { op: (s: string) => s.indexOf(' ') === -1, errMsg: 'Cannot have whitespace' },
} as const

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
        logError({ message: errMsg })
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

const createCreateExampleComponentCodeError = (causedBy: CliString): CliError => ({
  message: 'Could not create example component',
  causedBy,
})

const createExampleComponentCode = (): CliError | null => {
  try {
    if (!fs.existsSync('./src/button'))
      fs.mkdirSync('./src/button', { recursive: true })
  }
  catch (e: any) {
    return createCreateExampleComponentCodeError(
      c => `Could not create ${c.cyan('./src/button')} directory.\n${e.message}`,
    )
  }

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
  try {
    fs.writeFileSync('./src/button/index.tsx', buttonComponentCode)
  }
  catch (e: any) {
    return createCreateExampleComponentCodeError(
      c => `Could not create ${c.cyan('./src/button/index.tsx')} file.\n${e.message}`,
    )
  }

  const buttonComponentScssCode = `$bg-color: #fff;
$border: 1px solid #ccc;
$border-radius: 5px;

.cl-button {
  background-color: $bg-color;
  border: $border;
  border-radius: $border-radius;
  cursor: pointer;
  padding: 5px 10px;

  &:hover {
    background-color: darken($bg-color, 10)
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
  try {
    fs.writeFileSync('./src/button/index.scss', buttonComponentScssCode)
  }
  catch (e: any) {
    return createCreateExampleComponentCodeError(
      c => `Could not create ${c.cyan('./src/button/index.scss')} file.\n${e.message}`,
    )
  }

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
  try {
    fs.writeFileSync('./src/button/index.exh.ts', buttonComponentExhibitCode)
  }
  catch (e: any) {
    return createCreateExampleComponentCodeError(
      c => `Could not create ${c.cyan('./src/button/index.exh.ts')} file.\n${e.message}`,
    )
  }

  return null
}

const createAddGitIgnoreEntryError = (causedBy: CliString): CliError => ({
  message: 'Could not add git ignore entry',
  causedBy,
})

const addGitIgnoreEntry = (): CliError | null => {
  const gitIgnorePath = './.gitignore'
  const gitIgnoreEntries: string[] = [
    '/node_modules',
    '/.exh',
  ]
  let alreadyExists: boolean
  try {
    alreadyExists = fs.existsSync(gitIgnorePath)
  }
  catch (e: any) {
    return createAddGitIgnoreEntryError(c => `Could not determine if git ignore file already exists (${c.cyan(gitIgnorePath)}) - ${e.message}`)
  }

  let newGitIgnoreContent: string
  if (alreadyExists) {
    let gitIgnoreContent: string
    try {
      gitIgnoreContent = fs.readFileSync(gitIgnorePath, { encoding: 'utf8' })
    }
    catch (e: any) {
      return createAddGitIgnoreEntryError(c => `Could not read in existing git ignore file content (${c.cyan(gitIgnorePath)}) - ${e.message}`)
    }
    const missingGitIgnoreEntries = gitIgnoreEntries.filter(entry => !gitIgnoreContent.split('\n').some(line => line.trim() === entry))
    newGitIgnoreContent = gitIgnoreContent.concat(missingGitIgnoreEntries.join('\n'))
  }
  else {
    newGitIgnoreContent = gitIgnoreEntries.join('\n')
  }

  try {
    fs.writeFileSync(gitIgnorePath, newGitIgnoreContent)
  }
  catch (e: any) {
    return createAddGitIgnoreEntryError(c => `Could not create new git ignore file (${c.cyan(gitIgnorePath)}) - ${e.message}`)
  }
  return null
}

const npmInstallPackages = async (packages: (string | { name: string, isDev?: boolean })[]) => {
  for (let i = 0; i < packages.length; i += 1) {
    const packageInfo = packages[i]
    const packageName = typeof packageInfo === 'string' ? packageInfo : packageInfo.name
    const isDev = typeof packageInfo === 'string' ? false : (packageInfo.isDev ?? false)
    logStep(`Installing ${packageName}`)
    // Install package, if not already
    // eslint-disable-next-line no-await-in-loop
    const error = await npmInstallPackage(packageName, isDev)
    if (error != null) {
      logError(createInstallDependenciesError(`Could not npm install ${packageName} - ${error.execError.message}`))
      // eslint-disable-next-line no-await-in-loop
      const shouldContinue = await askShouldContinue()
      if (!shouldContinue)
        exit(1)
    }
  }
}

export const init = baseCommand('init', async () => {
  logWarn('\'init\' command is currently in beta')

  // Ensure that package.json exists
  const doesPackageJsonFileExists = fs.existsSync('./package.json')
  if (!doesPackageJsonFileExists)
    return createInitPackageJsonError(c => `${c.cyan('./package.json')} file does not exist. Run ${c.cyan('npm init -y')}' first.`)

  logStep('Modifying package.json file')
  // Modify package.json file, e.g. add "exh" npm script
  let err = await modifyPackageJsonFile()
  if (err != null)
    return err

  await npmInstallPackages([
    'react',
    'react-dom',
    'typescript',
    { name: '@types/react', isDev: true },
  ])

  logStep('Creating Exhibitor config file')
  // Create exh.config.json file
  err = await createExhConfigFile()
  if (err != null)
    return err

  logStep('Creating example component code')
  err = createExampleComponentCode()
  if (err != null)
    return err

  logStep('Adding gitignore entries')
  err = addGitIgnoreEntry()
  if (err != null)
    return err

  logSuccess(c => `${(c.bold as any).green('Done!')} - Run ${c.cyan('npm run exh')}`)

  return null
})
