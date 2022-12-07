import React from 'react'
import { NavLink, NavLinkProps, useLocation } from 'react-router-dom'

export const NavLinkKeeyQuery = (props: NavLinkProps & React.RefAttributes<HTMLAnchorElement>) => {
  const location = useLocation()

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <NavLink to={{ pathname: props.to, search: location.search }} {...props}>
      {props.children}
    </NavLink>
  )
}
