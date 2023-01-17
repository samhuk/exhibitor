import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../../common/name'
import { CheckPackageResultType, checkPackages as _checkPackages, CheckPackagesResult } from '../../../common/npm/checkPackages'
import { logWarn, logStep, logSuccess } from '../../logging'
import { CliError, CliString } from '../../types'

export type StartCommandCheckPackagesResult<
  THasErrors extends boolean = boolean
> = CheckPackagesResult<true, THasErrors, 'react' | 'react-dom'>

const REQUIRED_PACKAGES = ['react', 'react-dom'] as const

export const createCheckPackagesError = (causedBy: CliString, packageName: string): CliError => ({
  message: c => `Failed to start ${NPM_PACKAGE_CAPITALIZED_NAME}. Package check failed for ${c.underline(packageName)}.`,
  causedBy,
})

export const checkPackages = () => {
  logStep('Checking that required packages are installed.')
  const checkPackagesResult = _checkPackages(REQUIRED_PACKAGES, {
    stopOnError: true,
    onGetResult: result => {
      if (result.type === CheckPackageResultType.SUCCESS_NO_VERSION)
        logWarn(result.warningMsg)

      if (result.type !== CheckPackageResultType.ERROR) {
        const version = result.type === CheckPackageResultType.SUCCESS ? result.version : null
        logSuccess(c => `Using ${c.underline(result.name)} (${c.cyan(version)}) from ${c.cyan(result.path)}`, true)
      }
    },
  })

  return checkPackagesResult
}
