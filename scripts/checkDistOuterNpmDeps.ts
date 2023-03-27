/**
 * This script checks that the npm dependencies within the ./dist directory
 * match those of the top-level ./package.json.
 *
 * It will exit with code 0 if there are no problems, 1 otherwise.
 */

import * as fs from 'fs'
import { exit } from 'process'
import { createGFError } from 'good-flow'
import { TypeDependantBaseIntersection } from '@samhuk/type-helpers'

import { log, logSuccess } from '../src/common/logging'

type PackageDeps = { [packageName: string]: string }

enum DepComparisonResultType {
  DIFFERENT,
  SAME,
  OUTER_MISSING,
}

type DepComparisonResult<
  TDepComparisonResultType extends DepComparisonResultType = DepComparisonResultType
> = { packageName: string } & TypeDependantBaseIntersection<
  DepComparisonResultType,
  {
    [DepComparisonResultType.SAME]: {
      distVersion: string
    }
    [DepComparisonResultType.DIFFERENT]: {
      outerVersion: string, distVersion: string
    }
    [DepComparisonResultType.OUTER_MISSING]: {
      distVersion: string
    }
  },
  TDepComparisonResultType
>

const getPackageJsonDeps = (packageJsonFilePath: string): PackageDeps => {
  const outerPackageJsonString = fs.readFileSync(packageJsonFilePath, { encoding: 'utf8' })
  const outerPackageJson = JSON.parse(outerPackageJsonString)
  return outerPackageJson.dependencies
}

const determineDepComparisonResultList = (
  outerDeps: PackageDeps,
  distDeps: PackageDeps,
): DepComparisonResult[] => Object.entries(distDeps).map<DepComparisonResult>(([packageName, distVersion]) => {
  const outerVersion = outerDeps[packageName]
  if (outerVersion == null)
    return { type: DepComparisonResultType.OUTER_MISSING, packageName, distVersion }

  return {
    type: distVersion === outerVersion ? DepComparisonResultType.SAME : DepComparisonResultType.DIFFERENT,
    packageName,
    outerVersion,
    distVersion,
  }
})

/**
 * @returns `true` if no problem, `false` otherwise.
 */
const logDepComparsionResult = (result: DepComparisonResult): boolean => {
  switch (result.type) {
    case DepComparisonResultType.SAME: {
      logSuccess(c => `${result.packageName} (${c.cyan(result.distVersion)})`)
      return true
    }
    case DepComparisonResultType.DIFFERENT: {
      createGFError(c => `Dist dependency '${result.packageName}' does not agree with outer (dist=${c.cyan(result.distVersion)}, outer=${c.cyan(result.outerVersion)})`).log()
      return false
    }
    case DepComparisonResultType.OUTER_MISSING: {
      createGFError(c => `Dist dependency '${result.packageName}' is not an outer dependency (dist version: ${c.cyan(result.distVersion)})`).log()
      return false
    }
  }

  return true
}

/**
 * @returns `true` if no problem, `false` otherwise.
 */
const logDepComparsionResultList = (results: DepComparisonResult[]): number => {
  let numErrors = 0

  for (let i = 0; i < results.length; i += 1) {
    if (!logDepComparsionResult(results[i]))
      numErrors += 1
  }

  return numErrors
}

const main = () => {
  const outerDeps = getPackageJsonDeps('./package.json')
  const distDeps = getPackageJsonDeps('./dist/npm/exhibitor/package.json')

  log('')
  const results = determineDepComparisonResultList(outerDeps, distDeps)

  const numErrors = logDepComparsionResultList(results)

  const hasErrors = numErrors > 0

  console.log('')
  log(c => (hasErrors ? c.red(`${numErrors.toString()} errors`) : c.green('0 errors')))

  exit(hasErrors ? 1 : 0)
}

main()
