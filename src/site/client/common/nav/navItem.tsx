import React from 'react'
import { NavItemOptions } from './types'
import Ternary from '../ternary'

export const render = (props: { navItem: NavItemOptions }) => (
  <button
    type="button"
    className={`nav-item${(props.navItem.active ?? false) ? ' active' : ''}`}
    title={props.navItem.text}
    onClick={props.navItem.onClick}
  >
    <div className="wrapper">
      <Ternary bool={props.navItem.iconName != null} t={<i className={`fas fa-${props.navItem.iconName}`} />} />
      <div className="text" title={props.navItem.text}>{props.navItem.text}</div>
    </div>
  </button>
)

export default render
