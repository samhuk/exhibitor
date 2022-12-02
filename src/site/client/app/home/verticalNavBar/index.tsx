import React from 'react'
import { NavLink } from 'react-router-dom'

import { ComponentExhibit } from '../../../../../api/exhibit/types'
import { useAppSelector } from '../../../store'
import { LoadingState } from '../../../store/types'

export const render = () => {
  const state = useAppSelector(s => s.componentExhibits)

  if (state.ready) {
    const exhibitNames = exh.default.map(e => e.name)
    const ungroupedExhibits: ComponentExhibit[] = []
    // Determine the distinct exhibit group names
    const groupNameToExhibits: { [groupName: string]: ComponentExhibit[] } = {}
    const groupNames: string[] = exh.default.reduce<string[]>((acc, e) => {
      if (e.groupName == null) {
        ungroupedExhibits.push(e)
        return acc
      }

      if (groupNameToExhibits[e.groupName] == null)
        groupNameToExhibits[e.groupName] = []

      groupNameToExhibits[e.groupName].push(e)
      return acc.indexOf(e.groupName) === -1 ? acc.concat(e.groupName) : acc
    }, [])

    return (
      <div className="vertical-nav-bar">
        {groupNames.map(groupName => (
          <div className="group">
            <div className="name">{groupName}</div>
            <div className="exhibits">
              {groupNameToExhibits[groupName].map(exhibit => (
                <NavLink to={exhibit.name}>{exhibit.name}</NavLink>
              ))}
            </div>
          </div>
        ))}
        <div className="ungrouped">
          <div className="exhibits">
            {ungroupedExhibits.map(exhibit => (
              <NavLink to={exhibit.name}>{exhibit.name}</NavLink>
            ))}
          </div>
        </div>
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
