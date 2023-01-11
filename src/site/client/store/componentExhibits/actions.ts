import { LoadingState } from '../types'

export enum BottomBarType {
  Props,
  EventLog,
  Code,
  axe,
  Testing
}

export const READY = 'componentExhibits/ready'

export const SELECT_VARIANT = 'componentExhibits/selectVariant'

export const SELECT_BOTTOM_BAR = 'componentExhibits/selectBottomBar'

export const ADD_EVENT = 'componentExhibits/addEvent'

export const CHANGE_HAS_UNSEEN_EVENTS = 'componentExhibits/changeHasUnseenEvents'

export const UPDATE_VIEWPORT_SIZE = 'componentExhibits/updateViewportSize'

export const TOGGLE_VIEWPORT_SIZE_CHANGE_ENABLED = 'componentExhibits/toggleViewportSizeChangeEnabled'

export const APPLY_WORKING_VIEWPORT_SIZE = 'componentExhibits/applyWorkingViewportSize'

export const UPDATE_WORKING_VIEWPORT_SIZE = 'componentExhibits/updateWorkingViewportSize'

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
  workingViewportRectSizePx: { width: number, height: number }
  exhibitCode: string
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

type UpdateViewportSizeAction = {
  type: typeof UPDATE_VIEWPORT_SIZE
  viewportRectSizePx: { width: number, height: number }
}

type ToggleViewportSizeChangeEnabledAction = {
  type: typeof TOGGLE_VIEWPORT_SIZE_CHANGE_ENABLED
  enabled?: boolean
}

type UpdateWorkingViewportSize = {
  type: typeof UPDATE_WORKING_VIEWPORT_SIZE
  viewportRectSizePx: { width: number, height: number }
}

type ApplyWorkingViewportSize = {
  type: typeof APPLY_WORKING_VIEWPORT_SIZE
}

export type ComponentExhibitsActions = ReadyAction
  | SelectVariantAction
  | SelectBottomBarAction
  | AddEventAction
  | ChangeHasUnseenEventsAction
  | UpdateViewportSizeAction
  | ToggleViewportSizeChangeEnabledAction
  | UpdateWorkingViewportSize
  | ApplyWorkingViewportSize

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

export const updateViewportSize = (viewportRectSizePx: { width: number, height: number }): ComponentExhibitsActions => ({
  type: UPDATE_VIEWPORT_SIZE,
  viewportRectSizePx,
})

export const toggleViewportSizeChangeEnabled = (): ComponentExhibitsActions => ({
  type: TOGGLE_VIEWPORT_SIZE_CHANGE_ENABLED,
})

export const updateWorkingViewportSize = (viewportRectSizePx: { width: number, height: number }): ComponentExhibitsActions => ({
  type: UPDATE_WORKING_VIEWPORT_SIZE,
  viewportRectSizePx,
})

export const applyWorkingViewportSize = (): ComponentExhibitsActions => ({
  type: APPLY_WORKING_VIEWPORT_SIZE,
})
