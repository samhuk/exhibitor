import { npmInstallPackage } from '../../../common/npm'
import { askShouldContinueIfNotExit } from '../../common/input'
import { logStep, logError } from '../../logging'
import { CliString, CliError } from '../../types'

const createError = (causedBy: CliString): CliError => ({
  message: 'Could not install dependencies.',
  causedBy,
})

export const installNpmDependencies = async (packages: (string | { name: string, isDev?: boolean })[]) => {
  for (let i = 0; i < packages.length; i += 1) {
    const packageInfo = packages[i]
    const packageName = typeof packageInfo === 'string' ? packageInfo : packageInfo.name
    const isDev = typeof packageInfo === 'string' ? false : (packageInfo.isDev ?? false)
    logStep(`Installing ${packageName}`)
    // Install package, if not already
    // eslint-disable-next-line no-await-in-loop
    const error = await npmInstallPackage(packageName, isDev)
    if (error != null) {
      logError(createError(`Could not npm install ${packageName} - ${error.execError.message}`))
      // eslint-disable-next-line no-await-in-loop
      await askShouldContinueIfNotExit()
    }
  }
}
