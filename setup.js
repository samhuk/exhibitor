/**
 * This script performs various tasks that setup the template.
 *
 * It replaces instances of placeholder words, runs `npm i`, etc.
 *
 * To run this script, run `node setup.js` from the app template root directory.
 */

const { exec } = require('child_process')
const fs = require('fs')
const readline = require('readline')

const r1 = readline.createInterface({ input: process.stdin, output: process.stdout })

const capitalize = s=> `${s.charAt(0).toUpperCase()}${s.slice(1)}`

const dashCaseToCamelCase = s => s.replace(/-([a-z0-9])/g, (_, m) => `${m.toUpperCase()}`)

const VALIDATORS = {
  isNonEmptyString: { op: s => s != null && s.length > 0, errMsg: 'Cannot be empty' },
  hasNoSpaces: { op: s => s.indexOf(' ') === -1, errMsg: 'Cannot have whitespace' },
}

const tryGetInput = (question, onComplete, validators, defaultIfEmpty) => {
  const _question = defaultIfEmpty != null ? `${question} [${defaultIfEmpty}]: ` : `${question}: `
  r1.question(_question, name => {
    const isEmpty = !VALIDATORS.isNonEmptyString.op(name)
    if (isEmpty && defaultIfEmpty != null) {
      onComplete(defaultIfEmpty)
    }
    else if (validators != null) {
      const errMsgList = validators.reduce((acc, validator) => (validator.op(name) ? acc : acc.concat(validator.errorMsg)), [])
      if (errMsgList.length === 0) {
        onComplete(name)
      }
      else {
        console.log('Error:', errMsgList.join(', '))
        tryGetInput(question, onComplete, validators, defaultIfEmpty)
      }
    }
    else {
      onComplete(name)
    }
  })
}

const getDashCaseAppName = () => new Promise((res, rej) => {
  tryGetInput('app-name', res, [VALIDATORS.hasNoSpaces], 'example-app')
})

const getCamelCaseAppName = (defaultValue) => new Promise((res, rej) => {
  tryGetInput('appName', res, [], defaultValue ?? 'exampleApp')
})

const getNpmAppName = (defaultValue) => new Promise((res, rej) => {
  tryGetInput('npm-app-name', res, [VALIDATORS.hasNoSpaces], defaultValue ?? 'example-app')
})

const getLicenseName = () => new Promise((res, rej) => {
  tryGetInput('license-name', res, [], 'Joe Bloggs')
})

const getLicenseEmail = () => new Promise((res, rej) => {
  tryGetInput('license-email', res, [VALIDATORS.hasNoSpaces], 'joebloggs@email.com')
})

const getGithubUserName = () => new Promise((res, rej) => {
  tryGetInput('github-user-name', res, [VALIDATORS.hasNoSpaces], 'joebloggs')
})

const getAppSlogan = () => new Promise((res, rej) => {
  tryGetInput('app-slogan', res, [], 'Delightful App')
})

const _replaceTokensInFiles = (filePaths, tokenMapEntries, i, onComplete) => {
  if (i >= filePaths.length) {
    onComplete()
    return
  }

  const filePath = filePaths[i]

  console.log(`--> ${filePath}`)

  const fileText = fs.readFileSync(filePath, 'utf8')
  let newFileText = fileText
  tokenMapEntries.forEach(tokenMapEntry => {
    newFileText = newFileText.replace(new RegExp(tokenMapEntry[0], 'g'), tokenMapEntry[1])
  })
  fs.writeFileSync(filePath, newFileText)

  _replaceTokensInFiles(filePaths, tokenMapEntries, i + 1, onComplete)
}

const replaceTokensInFiles = (filePaths, tokenMap) => new Promise((res, rej) => {
  console.log('\n==> Replacing some placeholder words in files...')
  const tokenMapEntries = Object.entries(tokenMap)
  _replaceTokensInFiles(filePaths, tokenMapEntries, 0, res)
})

const renameDirsAndFiles = (
  dashCaseAppName,
  camelCaseAppName,
) => {
  console.log('\n==> Renaming some directories and files...')
  const paths = [
    './src/app-name',
    './src/demo/client/components/showcase/appName.tsx',
    './src/demo/client/components/common/generic/appName.tsx',
  ]
  console.log(`--> ${paths[0]}`)
  fs.renameSync(paths[0], `./src/${dashCaseAppName}`)
  console.log(`--> ${paths[1]}`)
  fs.renameSync(paths[1], `./src/demo/client/components/showcase/${camelCaseAppName}.tsx`)
  console.log(`--> ${paths[2]}`)
  fs.renameSync(paths[2], `./src/demo/client/components/common/generic/${camelCaseAppName}.tsx`)
}

const npmInstall = () => new Promise((res, rej) => {
  console.log('==> Installing npm dependencies...')
  exec('npm i', err => {
    if (err != null)
      console.log(err)
    else
      res()
  })
})

const main = async () => {
  const dashCaseAppName = await getDashCaseAppName()
  const defaultCamelCaseAppName = dashCaseToCamelCase(dashCaseAppName)

  const camelCaseAppName = await getCamelCaseAppName(defaultCamelCaseAppName)
  const pascalCaseAppName = capitalize(camelCaseAppName)
  const npmAppName = await getNpmAppName(dashCaseAppName)
  const licenseName = await getLicenseName()
  const licenseEmail = await getLicenseEmail()
  const githubUserName = await getGithubUserName()
  const appSlogan = await getAppSlogan()

  const nonDoubleDashedTokenMap = {
    'app-name': dashCaseAppName,
    'appName': camelCaseAppName,
    'AppName': pascalCaseAppName,
    'npm-app-name': npmAppName,
    'license-name': licenseName,
    'license-email': licenseEmail,
    'github-user-name': githubUserName,
    'app-slogan': appSlogan,
  }

  console.log('Using token map:', JSON.stringify(nonDoubleDashedTokenMap, null, 2))

  const doubleDashedTokenMap = {}
  Object.keys(nonDoubleDashedTokenMap).forEach(token => doubleDashedTokenMap[`{{${token}}}`] = nonDoubleDashedTokenMap[token])

  const filePathsWithDoubleDashTokens = [
    './README.md',
    './package.json',
    './LICENSE',
    './contributing/development.md',
  ]

  const filePathsWithNonDoubleDashTokens = [
    './src/index.ts',
    './src/types.ts',
    './src/app-name/types.ts',
    './src/app-name/index.ts',
    './src/app-name/styles/index.scss',
    './src/app-name/index.spec.ts',
    './src/demo/client/components/showcase/index.tsx',
    './src/demo/client/components/showcase/appName.tsx',
    './src/demo/client/components/common/generic/appName.tsx',
    './src/demo/client/components/header/index.tsx',
    './src/demo/client/components/body.tsx',
    './src/demo/client/components/app.tsx',
    './buildScripts/buildComponentStyles.ts',
    './buildScripts/watchClient.ts',
  ]

  await replaceTokensInFiles(filePathsWithDoubleDashTokens, doubleDashedTokenMap)
  await replaceTokensInFiles(filePathsWithNonDoubleDashTokens, nonDoubleDashedTokenMap)

  renameDirsAndFiles(dashCaseAppName, camelCaseAppName)

  await npmInstall()

  console.log('\nSetup complete! Run `npm start` to start the demo site. Happy hacking! :)')
  r1.close()
}

main()
