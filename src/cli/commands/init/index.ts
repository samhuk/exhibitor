import { baseCommand } from '../common'
import { createExhConfigFile } from './exhConfigFile'
import { createExampleComponentCode } from './exampleComponent'
import { addGitIgnoreEntries } from './addGitIgnoreEntries'
import { initPackageJson } from './packageJsonFile'
import { installNpmDependencies } from './npmDependencies'
import { logStep, logSuccess } from '../../../common/logging'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../../common/name'

export const init = baseCommand('init', async () => {
  let err = await initPackageJson()
  if (err != null)
    return err

  await installNpmDependencies([
    'react',
    'react-dom',
    { name: 'typescript', isDev: true },
    { name: '@types/react', isDev: true },
  ])

  logStep(`Creating ${NPM_PACKAGE_CAPITALIZED_NAME} configuration file`)
  err = await createExhConfigFile()
  if (err != null)
    return err

  logStep('Creating example component code')
  err = createExampleComponentCode()
  if (err != null)
    return err

  logStep('Adding gitignore entries')
  err = addGitIgnoreEntries()
  if (err != null)
    return err

  logSuccess(c => `${(c.bold as any).green('Done!')} - Run ${c.cyan('npm run exh')}`)

  return null
})
