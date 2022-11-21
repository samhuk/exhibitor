import { LoadingState } from '../types'

export const READY = 'componentExhibits/ready'

export type ComponentExhibitsState = {
  ready: boolean
  loadingState: LoadingState
  error: any
}

type ReadyAction = {
  type: typeof READY
  error: any
}

export type ComponentExhibitsActions = ReadyAction

export const componentExhibitsReady = (error: any): ComponentExhibitsActions => ({
  type: READY,
  error,
})
