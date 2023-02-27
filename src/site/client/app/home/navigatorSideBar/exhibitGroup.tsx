import React from 'react'
import { ExhibitNode, ExhibitNodeType } from '../../../../../api/exhibit/types'
import Button from '../../../../../ui-component-library/button'
import Icon from '../../../../../ui-component-library/icon'
import { calcNodePaddingLeft } from './common'

export const render = (props: {
  node: ExhibitNode<ExhibitNodeType.EXHIBIT_GROUP>
  isExpanded: boolean
  onClick: () => void
}) => (
  <Button
    className="exhibit-group"
    style={{ paddingLeft: calcNodePaddingLeft(props.node) }}
    onClick={props.onClick}
  >
    <Icon iconName={props.isExpanded ? 'angle-down' : 'angle-right'} />
    <div className="text">{props.node.groupName}</div>
  </Button>
)

export default render
