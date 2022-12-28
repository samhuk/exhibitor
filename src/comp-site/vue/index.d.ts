/**
 * This file defines the globally variables exposed
 * by the exhibitor JS API functions like `exhibit()`.
 */
import { ComponentExhibits, ExhibitNodes, PathTree } from '../../api/exhibit/types'

declare interface ComponentExhibitGlobals {
  default: ComponentExhibits
  nodes: ExhibitNodes
  pathTree: PathTree
}

declare global {
  const exh: ComponentExhibitGlobals
}
