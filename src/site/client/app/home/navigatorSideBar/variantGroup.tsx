import React from 'react'
import { ExhibitNode, ExhibitNodeType } from '../../../../../api/exhibit/types'
import Button from '../../../../../ui-component-library/button'
import { calcNodePaddingLeft } from './common'

export const render = (props: {
  node: ExhibitNode<ExhibitNodeType.VARIANT_GROUP>
  isExpanded: boolean
  onClick: () => void
}) => (
  <Button
    className="variant-group"
    style={{ paddingLeft: calcNodePaddingLeft(props.node) }}
    onClick={props.onClick}
    icon={{ name: props.isExpanded ? 'angle-down' : 'angle-right' }}
  >
    <div className="text">{props.node.variantGroup.name}</div>
  </Button>
)

export default render
