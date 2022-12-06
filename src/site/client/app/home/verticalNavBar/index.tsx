import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

import { ComponentExhibit, Variant, VariantGroup } from '../../../../../api/exhibit/types'
import Ternary from '../../../common/ternary'
import { useAppSelector } from '../../../store'
import { LoadingState } from '../../../store/types'

const VariantEl = (
  props: {
    path: string
    variant: Variant
  },
) => (
  <NavLink to={props.path != null ? `${props.path}/${encodeURIComponent(props.variant.name)}` : encodeURIComponent(props.variant.name)}>
    <i className="far fa-file" />
    <span className="name">{props.variant.name}</span>
  </NavLink>
)

const VariantGroupEl = (props: {
  exhibit: ComponentExhibit<true>
  variantGroup: VariantGroup
  path?: string
  key: string|number
  isTopLevel?: boolean
}) => (
  <div key={props.key} className="variant-group">
    <button type="button" className="name">
      <i className="fas fa-angle-down" />
      <div className="text">{props.variantGroup.name}</div>
    </button>
    <div className="variants">
      <Ternary
        bool={(props.isTopLevel ?? true) && (props.exhibit.showDefaultVariant ?? true) && props.exhibit.defaultProps != null}
        t={(
          <VariantEl path={props.path} variant={{ name: 'Default', props: props.exhibit.defaultProps }} key="default" />
        )}
      />
      {Object.values(props.variantGroup.variants).map((variant, i) => (
        <VariantEl path={props.path} variant={variant} key={i + 1} />
      ))}
    </div>
    <div className="variant-groups">
      {Object.values(props.variantGroup.variantGroups).map((variantGroup, i) => (
        <VariantGroupEl
          key={i + 1}
          exhibit={props.exhibit}
          variantGroup={variantGroup}
          path={props.path != null ? `${props.path}/${encodeURIComponent(variantGroup.name)}` : encodeURIComponent(variantGroup.name)}
          isTopLevel={false}
        />
      ))}
    </div>
  </div>
)

const ExhibitEl = (props: {
  exhibit: ComponentExhibit
  key: string | number
}) => (
  props.exhibit.hasProps
    ? <VariantGroupEl exhibit={props.exhibit} variantGroup={props.exhibit} path={props.exhibit.name} key={props.key} />
    : <VariantEl path="" variant={{ name: props.exhibit.name, props: undefined }} key="default" />
)

const determineExhibitGroupingInfo = () => {
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

  return {
    ungroupedExhibits,
    groupNameToExhibits,
    groupNames,
  }
}

export const render = () => {
  const state = useAppSelector(s => s.componentExhibits)
  const [expandedExhibitGroupsState, setExpandedExhibitGroupsState] = useState<string[]>([])

  const onGroupNameClick = (groupName: string) => {
    if (expandedExhibitGroupsState.indexOf(groupName) === -1)
      setExpandedExhibitGroupsState(expandedExhibitGroupsState.concat(groupName))
    else
      setExpandedExhibitGroupsState(expandedExhibitGroupsState.filter(n => n !== groupName))
  }

  if (state.ready) {
    const exhibitGroupingInfo = determineExhibitGroupingInfo()

    return (
      <div className="vertical-nav-bar">
        {exhibitGroupingInfo.groupNames.map(groupName => {
          const isExpanded = expandedExhibitGroupsState.indexOf(groupName) !== -1
          return (
            <div className={`group ${isExpanded ? 'expanded' : 'collapsed'}`}>
              <button type="button" className="name-wrapper" onClick={() => onGroupNameClick(groupName)}>
                <div className="name">
                  <i className={`fas ${isExpanded ? 'fa-angle-down' : 'fa-angle-right'}`} />
                  {groupName}
                </div>
              </button>
              {isExpanded
                ? (
                  <div className="exhibits">
                    {exhibitGroupingInfo.groupNameToExhibits[groupName].map((exhibit, i) => (
                      <ExhibitEl exhibit={exhibit} key={i + 1} />
                    ))}
                  </div>
                ) : null}
            </div>
          )
        })}
        <div className="ungrouped">
          <div className="exhibits">
            {exhibitGroupingInfo.ungroupedExhibits.map((exhibit, i) => (
              <ExhibitEl exhibit={exhibit} key={i + 1} />
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
