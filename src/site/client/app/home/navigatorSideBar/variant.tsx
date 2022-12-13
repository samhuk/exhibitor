import React from 'react'
import { ExhibitNode, ExhibitNodeType } from '../../../../../api/exhibit/types'
import { NavLinkKeeyQuery } from '../../../common/navLinkKeepQuery'
import { calcNodePaddingLeft } from './common'

export const render = (props: {
  node: ExhibitNode<ExhibitNodeType.VARIANT>
}) => (
  <NavLinkKeeyQuery
    to={props.node.path}
    onKeyDown={e => {
      if (e.key === ' ')
        (e.target as HTMLElement).click()
    }}
    className="variant"
    style={{ paddingLeft: calcNodePaddingLeft(props.node) }}
  >
    <i className="far fa-file" />
    <span className="name">{props.node.variant.name}</span>
  </NavLinkKeeyQuery>
)

export default render
