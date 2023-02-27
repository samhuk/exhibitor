import React from 'react'
import { CLASS_NAME_PREFIX } from '../common'

import NavItem from './navItem'
import { NavItemOptions } from './types'

type Props = { navItems: NavItemOptions[] }

export const NAME = 'nav'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`
export const DEFAULT_PROPS: Props = {
  navItems: [],
}

export const render = (props: Props) => {
  if (props.navItems == null)
    return null

  return (
    <ul className={CLASS_NAME}>
      {(props.navItems ?? DEFAULT_PROPS.navItems).map((ni, i) => (
        <NavItem navItem={ni} key={i.toString()} />
      ))}
    </ul>
  )
}

export default render
