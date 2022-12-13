import React from 'react'
import { ExhibitNode, ExhibitNodeType } from '../../../../../api/exhibit/types'
import { calcNodePaddingLeft } from './common'

export const render = (props: {
  node: ExhibitNode<ExhibitNodeType.EXHIBIT_GROUP>
  isExpanded: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    className="exhibit-group"
    style={{ paddingLeft: calcNodePaddingLeft(props.node) }}
    onClick={props.onClick}
  >
    <i className={`fas ${props.isExpanded ? 'fa-angle-down' : 'fa-angle-right'}`} />
    <div className="text">{props.node.groupName}</div>
  </button>
)

export default render
