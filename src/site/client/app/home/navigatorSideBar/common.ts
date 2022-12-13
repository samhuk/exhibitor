import { ExhibitNode } from '../../../../../api/exhibit/types'

const INDENTATION_PX = 8

export const calcNodePaddingLeft = (node: ExhibitNode) => (
  (INDENTATION_PX * (node.pathComponents.length - 1))
)
