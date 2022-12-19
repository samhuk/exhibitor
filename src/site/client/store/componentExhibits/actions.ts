import { LoadingState } from '../types'

export enum BottomBarType {
  Props,
  EventLog,
}

export const READY = 'componentExhibits/ready'

export const SELECT_VARIANT = 'componentExhibits/selectVariant'

export const SELECT_BOTTOM_BAR = 'componentExhibits/selectBottomBar'

export const ADD_EVENT = 'componentExhibits/addEvent'

export const CHANGE_HAS_UNSEEN_EVENTS = 'componentExhibits/changeHasUnseenEvents'

export const CHANGE_VIEWPORT = 'componentExhibits/changeViewport'

export const CHANGE_VIEWPORT_SIZE_CHANGE_ENABLED = 'componentExhibits/changeViewportSizeChangeEnabled'

export type ComponentExhibitsState = {
  ready: boolean
  selectedVariantPath: string
  loadingState: LoadingState
  error: any
  selectedBottomBarType: BottomBarType
  events: number[]
  hasUnseenEvents: boolean
  viewportSizeChangeEnabled: boolean
  viewportRectSizePx: { width: number, height: number }
}

type ReadyAction = {
  type: typeof READY
  error: any
}

type SelectVariantAction = {
  type: typeof SELECT_VARIANT
  variantNodePath: string
}

type SelectBottomBarAction = {
  type: typeof SELECT_BOTTOM_BAR
  barType: BottomBarType
}

type AddEventAction = {
  type: typeof ADD_EVENT
  id: number
}

type ChangeHasUnseenEventsAction = {
  type: typeof CHANGE_HAS_UNSEEN_EVENTS
  hasUnseenEvents: boolean
}

type ChangeViewportAction = {
  type: typeof CHANGE_VIEWPORT
  viewportRectSizePx: { width: number, height: number }
}

type ChangeViewportSizeChangeEnabledAction = {
  type: typeof CHANGE_VIEWPORT_SIZE_CHANGE_ENABLED
  enabled: boolean
}

export type ComponentExhibitsActions = ReadyAction
  | SelectVariantAction
  | SelectBottomBarAction
  | AddEventAction
  | ChangeHasUnseenEventsAction
  | ChangeViewportAction
  | ChangeViewportSizeChangeEnabledAction

export const componentExhibitsReady = (error: any): ComponentExhibitsActions => ({
  type: READY,
  error,
})

export const selectVariant = (variantNodePath: string): ComponentExhibitsActions => ({
  type: SELECT_VARIANT,
  variantNodePath,
})

export const selectBottomBar = (barType: BottomBarType): ComponentExhibitsActions => ({
  type: SELECT_BOTTOM_BAR,
  barType,
})

export const addEvent = (id: number): ComponentExhibitsActions => ({
  type: ADD_EVENT,
  id,
})

export const changeHasUnseenEvents = (hasUnseenEvents: boolean): ComponentExhibitsActions => ({
  type: CHANGE_HAS_UNSEEN_EVENTS,
  hasUnseenEvents,
})

export const changeViewport = (viewportRectSizePx: { width: number, height: number }): ComponentExhibitsActions => ({
  type: CHANGE_VIEWPORT,
  viewportRectSizePx,
})

export const changeViewportSizeChangeEnabled = (enabled: boolean): ComponentExhibitsActions => ({
  type: CHANGE_VIEWPORT_SIZE_CHANGE_ENABLED,
  enabled,
})
