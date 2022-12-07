import { LoadingState } from '../types'

export enum BottomBarType {
  Props,
  EventLog,
}

export const READY = 'componentExhibits/ready'

export const SELECT_VARIANT = 'componentExhibits/selectVariant'

export const SELECT_BOTTOM_BAR = 'componentExhibits/selectBottomBar'

export type ComponentExhibitsState = {
  ready: boolean
  selectedVariantPath: string[]
  selectedVariantPathFound: boolean
  loadingState: LoadingState
  error: any
  selectedBottomBarType: BottomBarType
}

type ReadyAction = {
  type: typeof READY
  error: any
}

type SelectVariantAction = {
  type: typeof SELECT_VARIANT
  variantPath: string[]
  found: boolean
}

type SelectBottomBarAction = {
  type: typeof SELECT_BOTTOM_BAR
  barType: BottomBarType
}

export type ComponentExhibitsActions = ReadyAction | SelectVariantAction | SelectBottomBarAction

export const componentExhibitsReady = (error: any): ComponentExhibitsActions => ({
  type: READY,
  error,
})

export const selectVariant = (variantPath: string[], found: boolean): ComponentExhibitsActions => ({
  type: SELECT_VARIANT,
  variantPath,
  found,
})

export const selectBottomBar = (barType: BottomBarType): ComponentExhibitsActions => ({
  type: SELECT_BOTTOM_BAR,
  barType,
})
