import { LoadingState } from '../types'
import { ComponentExhibit } from '../../../../componentsBuild/exhibit/types'

export const READY = 'componentExhibits/ready'

export type ComponentExhibitsState = {
  value: ComponentExhibit[]
  ready: boolean
  loadingState: LoadingState
  error: any
}

type ReadyAction = {
  type: typeof READY
  value: ComponentExhibit[]
  error: any
}

export type ComponentExhibitsActions = ReadyAction

export const componentExhibitsReady = (value: ComponentExhibit[], error: any): ComponentExhibitsActions => ({
  type: READY,
  value,
  error,
})
