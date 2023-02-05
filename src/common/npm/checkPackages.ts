import { BoolDependant, TypeDependantBaseIntersection } from '@samhuk/type-helpers'
import * as fs from 'fs'
import path from 'path'
import { ExhString } from '../exhString/types'
import { tryResolve } from './resolve'

export type SemVer = {
  majorStr: string
  minorStr: string
  patchStr: string
  major: number
  minor: number
  patch: number | string
}

const versionStringToSemVer = (versionString: string): SemVer => {
  const segmentStrings = versionString.split('.')
  const segmentNumbers = segmentStrings.map(p => parseInt(p))
  return {
    majorStr: segmentStrings[0],
    minorStr: segmentStrings[1],
    patchStr: segmentStrings[2],
    major: segmentNumbers[0],
    minor: segmentNumbers[1],
    patch: segmentNumbers[2],
  }
}

export enum CheckPackageResultType {
  SUCCESS = 'success',
  SUCCESS_NO_VERSION = 'successNoVersion',
  ERROR = 'error'
}

export type CheckPackageResult<
  TCheckPackageResultType extends CheckPackageResultType = CheckPackageResultType
> = TypeDependantBaseIntersection<CheckPackageResultType, {
  [CheckPackageResultType.SUCCESS]: {
    path: string
    version: string
    semVer: SemVer
  }
  [CheckPackageResultType.SUCCESS_NO_VERSION]: {
    path: string
    warningMsg: ExhString
  }
  [CheckPackageResultType.ERROR]: {
    errorMsg: ExhString
  }
}, TCheckPackageResultType, 'type'> & { name: string }

/**
 * Checks that the given package is resolvable and logs it's version if successfully
 * resolved (if verbose mode is enabled).
 */
const checkPackage = (packageName: string): CheckPackageResult => {
  const resolveResult = tryResolve(packageName)
  if (resolveResult.success === false) {
    return {
      type: CheckPackageResultType.ERROR,
      name: packageName,
      errorMsg: c => `Package ${c.underline(packageName)} could not be resolved. Is it installed (if not, try ${c.bold(`npm i -S ${packageName}`)})?. Else, this could be an issue with the package.json file of the package.\n\n  Specific details: ${resolveResult.error}`,
    }
  }

  const resolvedPath = resolveResult.path

  const packageJsonFilePath = path.join(path.dirname(resolvedPath), 'package.json')
  if (!fs.existsSync(packageJsonFilePath)) {
    return {
      type: CheckPackageResultType.SUCCESS_NO_VERSION,
      name: packageName,
      path: resolvedPath,
      warningMsg: c => `Could not determine the version of ${c.underline(packageName)} being used because the package.json file for it does not exist at: ${c.cyan(packageJsonFilePath)}.\n\nIf you know what you are doing, then this can be ignored, but this is an indication of a non-standard setup.`,
    }
  }

  try {
    const packageJsonString = fs.readFileSync(packageJsonFilePath, { encoding: 'utf8' })
    const packageJsonObj = JSON.parse(packageJsonString)
    const version = packageJsonObj.version

    return {
      type: CheckPackageResultType.SUCCESS,
      name: packageName,
      version,
      semVer: versionStringToSemVer(version),
      path: resolvedPath,
    }
  }
  catch (e) {
    return {
      type: CheckPackageResultType.SUCCESS_NO_VERSION,
      name: packageName,
      path: resolvedPath,
      warningMsg: c => `Could not determine the version of ${c.underline(packageName)} being used because the package.json file could not be read or parsed (${c.cyan(packageJsonFilePath)}).\n\nIf you know what you are doing, then this can be ignored, but this is an indication of a non-standard setup. Specific error:\n${e}`,
    }
  }
}

export type CheckPackageResults<
  TPackageNames extends string = string,
  TCheckPackageResultType extends CheckPackageResultType = CheckPackageResultType,
> = {
  [TPackageName in TPackageNames]: CheckPackageResult<TCheckPackageResultType>
}

export type CheckPackagesResult<
  TStopOnError extends boolean = boolean,
  THasErrors extends boolean = boolean,
  TPackageNames extends string = string,
> = BoolDependant<{
  true: (TStopOnError extends true
    ? {
      error: CheckPackageResult<CheckPackageResultType.ERROR>
    }
    : {
      errors: CheckPackageResults<TPackageNames, CheckPackageResultType.ERROR>
    }) & {
      results: CheckPackageResults<TPackageNames>
    }
  false: { results: CheckPackageResults<TPackageNames, CheckPackageResultType.SUCCESS | CheckPackageResultType.SUCCESS_NO_VERSION > }
}, THasErrors, 'hasErrors'>

type CheckPackagesOptions = {
  /**
   * @default false
   */
  stopOnError?: boolean
  onGetResult?: (result: CheckPackageResult) => void,
}

/**
 * Tries to resolve the given list of paths, returning a dictionary of their paths
 * and any errors encountered.
 *
 * @example
 * checkPackages(['playwright-core/cli', '@playwright/test'] as const, { stopOnError: true })
 */
export const checkPackages = <
  TPackageNameList extends Readonly<string[]> | string[],
  TOptions extends CheckPackagesOptions
>(
    packages: TPackageNameList,
    options?: TOptions,
  ): CheckPackagesResult<
  TOptions extends { stopOnError: true }
    ? true
    : false,
  boolean,
  TPackageNameList[number]
> => {
  const checkPackageResults: CheckPackageResults = {}
  const errors: CheckPackageResults<string, CheckPackageResultType.ERROR> = {}

  const stopOnError = options.stopOnError ?? false

  const shouldStop: (result: CheckPackageResult) => boolean = stopOnError
    ? result => result.type === CheckPackageResultType.ERROR
    : () => false

  for (let i = 0; i < packages.length; i += 1) {
    const result = checkPackage(packages[i])
    options?.onGetResult?.(result)

    checkPackageResults[result.name] = result
    if (result.type === CheckPackageResultType.ERROR)
      errors[result.name] = result

    if (shouldStop(result))
      break
  }

  const numErrors = Object.keys(errors).length
  const hasErrors = numErrors >= 1

  return (stopOnError
    ? hasErrors
      ? { results: checkPackageResults, hasErrors: true, error: errors[Object.keys(errors)[0]] } as CheckPackagesResult<true, true>
      : { results: checkPackageResults, hasErrors: false } as CheckPackagesResult<true, false>
    : hasErrors
      ? { results: checkPackageResults, hasErrors: true, errors } as CheckPackagesResult<false, true>
      : { results: checkPackageResults, hasErrors: false } as CheckPackagesResult<false, false>) as any
}
