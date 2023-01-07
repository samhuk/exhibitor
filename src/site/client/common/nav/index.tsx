import React from 'react'

import NavItem from './navItem'
import { NavItemOptions } from './types'

type Props = { navItems: NavItemOptions[] }

export const render = (props: Props) => {
  if (props.navItems == null)
    return null

  return (
    <ul className="nav">
      {props.navItems.map((ni, i) => (
        <NavItem navItem={ni} key={i.toString()} />
      ))}
    </ul>
  )
}

export default render
