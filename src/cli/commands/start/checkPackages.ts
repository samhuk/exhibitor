import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../../common/name'
import { CheckPackageResultType, checkPackages as _checkPackages, CheckPackagesResult } from '../../../common/npm/checkPackages'
import { logWarn, logStep, logSuccess, logStepHeader } from '../../logging'
import { getProcessVerbosity } from '../../state'
import { CliError, CliString } from '../../types'

export type StartCommandCheckPackagesResult<
  THasErrors extends boolean = boolean
> = CheckPackagesResult<true, THasErrors, 'react' | 'react-dom'>

const REQUIRED_PACKAGES = ['react', 'react-dom'] as const

const logMajorReactVersion = (reactMajorVersion: number | null) => {
  if (reactMajorVersion == null || Number.isNaN(reactMajorVersion)) {
    // eslint-disable-next-line max-len
    logWarn('Could not determine the React major version number. Will use Component Site for React versions >=18.\n\nIf you know what you are doing, then this can be ignored, but this is an indication of a non-standard setup.')
  }
  else if (reactMajorVersion >= 18) {
    logStep(c => `React major version is at or above version 18 (${c.cyan(reactMajorVersion.toString())}). Using Component Site for React versions >=18.`, true)
  }
  else if (reactMajorVersion < 18) {
    logStep(c => `React major version is earlier than version 18 (${c.cyan(reactMajorVersion.toString())}). Using Component Site for React versions <18.`, true)
  }
}

const extractReactMajorVersion = (results: StartCommandCheckPackagesResult): number | null => {
  const result = results.results.react
  if (result == null)
    return null

  if (result.type !== CheckPackageResultType.SUCCESS)
    return null

  logStep(c => `Determining the major version number of the installed React (from ${c.cyan(`'${result.version}'`)}).`, true)

  return result.semVer.major
}

export const createCheckPackagesError = (causedBy: CliString, packageName: string): CliError => ({
  message: c => `Failed to start ${NPM_PACKAGE_CAPITALIZED_NAME}. Package check failed for ${c.underline(packageName)}.`,
  causedBy,
})

export const checkPackages = (): CliError | { reactMajorVersion: number } => {
  logStepHeader('Checking that required packages are installed.', true)
  const results = _checkPackages(REQUIRED_PACKAGES, {
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

  if (results.hasErrors)
    return createCheckPackagesError(results.error.errorMsg, results.error.name)

  const reactMajorVersion = extractReactMajorVersion(results)
  logMajorReactVersion(reactMajorVersion)
  return { reactMajorVersion }
}
