import { BuildStatus } from '../../common/building'
import { areAllBuildStatusesSuccessful } from '../../intercom/common'
import { BuildStatuses, BuiltExhIdentity } from '../../intercom/types'

export type BuildStatusService = {
  statuses: BuildStatuses
  allSuccessful: boolean
  updateStatus: (identity: BuiltExhIdentity, newStatus: BuildStatus) => void
  updateStatuses: (newStatuses: BuildStatuses) => void
  getUnsuccessfulBuilds: () => { identity: BuiltExhIdentity, status: Exclude<BuildStatus, BuildStatus.SUCCESS> }[]
  waitUntilNextAllSuccessful: () => Promise<void>
}

export const createBuildStatusService = (initialStatuses?: Partial<BuildStatuses>): BuildStatusService => {
  let instance: BuildStatusService

  let allSuccessfulListenerFns: (() => void)[] = []

  return instance = {
    statuses: {
      COMP_LIB: initialStatuses.COMP_LIB ?? BuildStatus.NONE,
      SITE_SERVER: initialStatuses.SITE_SERVER ?? BuildStatus.NONE,
      SITE_CLIENT: initialStatuses.SITE_CLIENT ?? BuildStatus.NONE,
    },
    allSuccessful: false,
    getUnsuccessfulBuilds: () => Object.entries(instance.statuses)
      .filter(([identityType, status]) => status !== BuildStatus.SUCCESS)
      .map(([identityType, status]) => ({
        identity: identityType as BuiltExhIdentity,
        status: status as Exclude<BuildStatus, BuildStatus.SUCCESS>,
      })),
    updateStatus: (identityType, newStatus) => {
      instance.statuses[identityType] = newStatus

      instance.allSuccessful = areAllBuildStatusesSuccessful(instance.statuses)

      if (instance.allSuccessful)
        allSuccessfulListenerFns.forEach(fn => fn())
      allSuccessfulListenerFns = []
    },
    updateStatuses: newStatuses => {
      instance.statuses = newStatuses

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
