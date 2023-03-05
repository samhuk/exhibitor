import { logInfo } from '.'

export const logFeatureStatus = (featureName: string, status: 'alpha' | 'beta') => {
  logInfo(c => `${c.bgYellow(c.black(c.bold(' FEATURE STATUS NOTICE ')))} The ${c.underline(featureName)} feature is in ${status} status. Avoid using in production or for important things.\n`)
}
