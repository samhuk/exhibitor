import { BoolDependant } from '@samhuk/type-helpers'
import { exec, ExecException } from 'child_process'

export const npmInstallPackage = (
  packageName: string,
  isDevDep: boolean = false,
) => new Promise<{ execError: ExecException } | null>((res, rej) => {
  exec(`npm i ${isDevDep ? '--save-dev' : '--save'} ${packageName}`, err => {
    if (err != null)
      console.log({ execError: err })
    else
      res(null)
  })
})

type TryResolveResult<
  TSuccess extends boolean = boolean
> = BoolDependant<{
  true: { path: string }
  false: { error: any }
}, TSuccess, 'success'>

export const tryResolve = (
  packageNameOrScriptPath: string,
): TryResolveResult => {
  try {
    return { success: true, path: require.resolve(packageNameOrScriptPath) }
  }
  catch (error: any) {
    return { success: false, error }
  }
}
