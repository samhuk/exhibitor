import { createGFError, GFError } from 'good-flow'
import { GFString } from 'good-flow/lib/good-flow/string/types'
import { logStep } from '../../../common/logging'
import { npmInstallPackage } from '../../../common/npm/install'
import { askShouldContinueIfNotExit } from '../../common/input'

const createError = (cause: GFString): GFError => createGFError({
  msg: 'Could not install dependencies.',
  inner: createGFError({ msg: cause }),
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
      createError(c => `Could not npm install ${c.underline(packageName)} - ${error.execError.message}`).log()
      // eslint-disable-next-line no-await-in-loop
      await askShouldContinueIfNotExit()
    }
  }
}
