export enum BuildStatus {
  NONE = 'None',
  IN_PROGRESS = 'IN_PROGRESS',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export type BuildStatusReporter = {
  status: BuildStatus
  update: (newStatus: BuildStatus) => void
}

export const createBuildStatusReporter = (options: {
  onChange: (status: BuildStatus, prevStatus: BuildStatus) => void
}): BuildStatusReporter => {
  let instance: BuildStatusReporter
  return instance = {
    status: BuildStatus.NONE,
    update: newStatus => {
      const prevStatus = instance.status
      instance.status = newStatus
      options.onChange(instance.status, prevStatus)
    },
  }
}
