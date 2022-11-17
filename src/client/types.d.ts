import { ComponentExhibit } from '../api/componentExhibit'

declare interface ComponentExhibitGlobals {
  default: ComponentExhibit[]
}

declare global {
  const exh: ComponentExhibitGlobals
}
