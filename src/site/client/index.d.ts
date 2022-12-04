/**
 * This file defines the globally variables exposed
 * by the exhibitor JS API functions like `exhibit()`.
 */
import { ComponentExhibit } from '../../api/exhibit/types'

declare interface ComponentExhibitGlobals {
  default: ComponentExhibit[]
}

declare global {
  const exh: ComponentExhibitGlobals
}
