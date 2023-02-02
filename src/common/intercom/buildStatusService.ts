import { BuildStatus } from '../building'
import { BuildStatuses, BuildStatusService, BuiltIntercomIdentity } from './types'

export const areAllBuildStatusesSuccessful = (statuses: BuildStatuses) => !Object.values(statuses).some(s => s !== BuildStatus.SUCCESS)

export const createBuildStatusService = (): BuildStatusService => {
  let instance: BuildStatusService

  let allSuccessfulListenerFns: (() => void)[] = []

  return instance = {
    statuses: {
      CLI: BuildStatus.SUCCESS,
      CLIENT_WATCH: BuildStatus.NONE,
      COMP_LIB_WATCH: BuildStatus.NONE,
      SITE_SERVER: BuildStatus.SUCCESS,
    },
    allSuccessful: false,
    getUnsuccessfulBuilds: () => Object.entries(instance.statuses)
      .filter(([identityType, status]) => status !== BuildStatus.SUCCESS)
      .map(([identityType, status]) => ({
        identityType: identityType as BuiltIntercomIdentity,
        status: status as Exclude<BuildStatus, BuildStatus.SUCCESS>,
      })),
    update: (identityType, newStatus) => {
      instance.statuses[identityType] = newStatus

      instance.allSuccessful = areAllBuildStatusesSuccessful(instance.statuses)

      if (instance.allSuccessful)
        allSuccessfulListenerFns.forEach(fn => fn())
      allSuccessfulListenerFns = []
    },
    waitUntilNextAllSuccessful: () => new Promise<void>(res => {
      if (instance.allSuccessful)
        res()

      allSuccessfulListenerFns.push(res)
    }),
  }
}
