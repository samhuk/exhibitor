import { createExhError } from '../../../common/exhError'
import { ExhError } from '../../../common/exhError/types'
import { ExhString } from '../../../common/exhString/types'
import { logStep } from '../../../common/logging'
import { npmInstallPackage } from '../../../common/npm/install'
import { askShouldContinueIfNotExit } from '../../common/input'

const createError = (causedBy: ExhString): ExhError => createExhError({
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
      createError(`Could not npm install ${packageName} - ${error.execError.message}`).log()
      // eslint-disable-next-line no-await-in-loop
      await askShouldContinueIfNotExit()
    }
  }
}
