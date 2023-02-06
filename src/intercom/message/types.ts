import { TypeDependantBaseIntersection } from '@samhuk/type-helpers'
import { BuildStatus } from '../../common/building'
import { BuildStatuses, IntercomIdentityType } from '../types'

export enum IntercomMessageType {
  BUILD_STATUS_CHANGE = 'BUILD_STATUS_CHANGE',
  BUILD_STATUSES_NOTICE = 'BUILD_STATUSES_NOTICE',
  BUILD_STATUSES_CHANGE = 'BUILD_STATUSES_CHANGE',
  IDENTIFY = 'IDENTIFY',
}

export type IntercomMessageOptions<
  TType extends IntercomMessageType = IntercomMessageType,
  > = TypeDependantBaseIntersection<
  IntercomMessageType,
  {
    [IntercomMessageType.BUILD_STATUSES_NOTICE]: {
      statuses: BuildStatuses
    }
    [IntercomMessageType.BUILD_STATUS_CHANGE]: {
      prevStatus: BuildStatus
      status: BuildStatus
    }
    [IntercomMessageType.IDENTIFY]: { }
    [IntercomMessageType.BUILD_STATUSES_CHANGE]: {
      prevStatuses: BuildStatuses
      statuses: BuildStatuses
    }
  },
  TType
> & { to?: IntercomIdentityType }

export type IntercomMessage<
  TType extends IntercomMessageType = IntercomMessageType,
> = IntercomMessageOptions<TType> & { from: IntercomIdentityType }
