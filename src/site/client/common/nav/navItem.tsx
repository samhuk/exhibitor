import React from 'react'
import { NavItemOptions } from './types'

export const render = (props: { navItem: NavItemOptions }) => (
  <button
    type="button"
    className={`nav-item${(props.navItem.active ?? false) ? ' active' : ''}`}
    title={props.navItem.title ?? props.navItem.text}
    onClick={props.navItem.onClick}
  >
    <div className={`wrapper${props.navItem.text == null ? ' no-text' : ''}`}>
      {props.navItem.iconName != null
        ? <i className={`fas fa-${props.navItem.iconName}`} />
        : null}
      {props.navItem.text != null
        ? <div className="text" title={props.navItem.text}>{props.navItem.text}</div>
        : null}
    </div>
  </button>
)

export default render
