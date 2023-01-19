import { BoolDependant } from '@samhuk/type-helpers'

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
