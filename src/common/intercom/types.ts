import { OmitTyped, TypeDependantBaseIntersection } from '@samhuk/type-helpers'

export enum IntercomIdentityType {
  SITE_CLIENT = 'SITE_CLIENT',
  SITE_SERVER = 'SITE_SERVER',
  CLI = 'CLI',
  COMP_LIB_WATCH = 'COMP_LIB_WATCH',
  CLIENT_WATCH = 'CLIENT_WATCH',
}

export enum IntercomMessageType {
  COMPONENT_LIBRARY_BUILD_COMPLETED = 'COMPONENT_LIBRARY_BUILD_COMPLETED',
  SITE_CLIENT_BUILD_COMPLETED = 'SITE_CLIENT_BUILD_COMPLETED',
  SITE_SERVER_BUILD_COMPLETED = 'SITE_SERVER_BUILD_COMPLETED',
}

export type IntercomMessageOptions = OmitTyped<IntercomMessage, 'from'>

export type IntercomMessage<TType extends IntercomMessageType = IntercomMessageType> = TypeDependantBaseIntersection<
  IntercomMessageType,
  {
    [IntercomMessageType.COMPONENT_LIBRARY_BUILD_COMPLETED]: { },
    [IntercomMessageType.SITE_CLIENT_BUILD_COMPLETED]: { },
    [IntercomMessageType.SITE_SERVER_BUILD_COMPLETED]: { },
  },
  TType
> & { from: IntercomIdentityType, to: IntercomIdentityType }
