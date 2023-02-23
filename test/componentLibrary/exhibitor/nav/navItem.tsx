import React from 'react'
import Button from '../button'
import { NavItemOptions } from './types'

export const render = (props: { navItem: NavItemOptions }) => (
  <Button
    className={`nav-item${(props.navItem.active ?? false) ? ' active' : ''}`}
    title={props.navItem.title ?? props.navItem.text}
    onClick={props.navItem.onClick}
  >
    {props.navItem.additionalElement != null ? props.navItem.additionalElement : null}
    <div className={`wrapper${props.navItem.text == null ? ' no-text' : ''}`}>
      {props.navItem.iconName != null
        ? <i className={`fas fa-${props.navItem.iconName}`} />
        : null}
      {props.navItem.text != null
        ? <div className="text" title={props.navItem.text}>{props.navItem.text}</div>
        : null}
    </div>
  </Button>
)

export default render
