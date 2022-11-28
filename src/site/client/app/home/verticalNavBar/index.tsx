import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAppSelector } from '../../../store'
import { LoadingState } from '../../../store/types'

export const render = () => {
  const state = useAppSelector(s => s.componentExhibits)

  if (state.ready) {
    const exhibitNames = exh.default.map(e => e.name)
    return (
      <div className="vertical-nav-bar">
        {exhibitNames.map(name => (
          <NavLink to={name}>
            {name}
          </NavLink>
        ))}
      </div>
    )
  }

  if (state.loadingState === LoadingState.FETCHING)
    return <div className="vertical-nav-bar">Loading exhibits...</div>

  if (state.loadingState === LoadingState.FAILED)
    return <div className="vertical-nav-bar">Loading exhibits failed</div>

  return null
}

export default render
