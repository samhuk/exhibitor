import React from 'react'
import { ExhibitNode, ExhibitNodeType } from '../../../../../api/exhibit/types'
import { calcNodePaddingLeft } from './common'

export const render = (props: {
  node: ExhibitNode<ExhibitNodeType.VARIANT_GROUP>
  isExpanded: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    className="variant-group"
    style={{ paddingLeft: calcNodePaddingLeft(props.node) }}
    onClick={props.onClick}
  >
    <i className={`fas ${props.isExpanded ? 'fa-angle-down' : 'fa-angle-right'}`} />
    <div className="text">{props.node.variantGroup.name}</div>
  </button>
)

export default render
