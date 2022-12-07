import React, { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'

import { ComponentExhibit, Variant, VariantGroup } from '../../../../../api/exhibit/types'
import Ternary from '../../../common/ternary'
import { useAppSelector } from '../../../store'
import { LoadingState } from '../../../store/types'

/* This is early PoC code for the vertical nav side bar. It's my first time making one
 * with React so it's not in a high-quality state with concerns separated and such at the moment.
 * TODO: Improve this. See note above.
 */

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
  expandedPaths: string[]
  onGroupCollapse: (path: string) => void
  onGroupExpand: (path: string) => void
}) => {
  const initialIsExpanded = props.expandedPaths.indexOf(props.path) !== -1
  const [isExpanded, setIsExpanded] = useState(initialIsExpanded)
  const onGroupNameClick = () => {
    if (isExpanded)
      props.onGroupCollapse(props.path)
    else
      props.onGroupExpand(props.path)

    setIsExpanded(!isExpanded)
  }

  return (
    <div key={props.key} className="variant-group">
      <button type="button" className="name" onClick={() => onGroupNameClick()}>
        <i className={`fas ${isExpanded ? 'fa-angle-down' : 'fa-angle-right'}`} />
        <div className="text">{props.variantGroup.name}</div>
      </button>
      {isExpanded
        ? (
          <>
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
                  expandedPaths={props.expandedPaths}
                  onGroupCollapse={props.onGroupCollapse}
                  onGroupExpand={props.onGroupExpand}
                />
              ))}
            </div>
          </>
        ) : null}
    </div>
  )
}

const ExhibitEl = (props: {
  exhibit: ComponentExhibit
  key: string | number
  expandedPaths: string[]
  onGroupCollapse: (path: string) => void
  onGroupExpand: (path: string) => void
}) => (
  props.exhibit.hasProps
    ? (
      <VariantGroupEl
        exhibit={props.exhibit}
        variantGroup={props.exhibit}
        path={props.exhibit.name}
        key={props.key}
        expandedPaths={props.expandedPaths}
        onGroupCollapse={props.onGroupCollapse}
        onGroupExpand={props.onGroupExpand}
      />
    ) : <VariantEl path="" variant={{ name: props.exhibit.name, props: undefined }} key="default" />
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

const ExhibitGroupNameEl = (props: {
  groupName: string
  isExpanded: boolean
  onClick: () => void
}) => (
  <button type="button" className="name-wrapper" onClick={() => props.onClick()}>
    <div className="name">
      <i className={`fas ${props.isExpanded ? 'fa-angle-down' : 'fa-angle-right'}`} />
      <span className="text">{props.groupName}</span>
    </div>
  </button>
)

type NavBarState = {
  expandedExhibitGroups: string[]
  expandedPaths: string[]
}

const saveNavBarState = (state: NavBarState) => {
  const date = new Date().setFullYear(new Date().getFullYear() + 1)
  document.cookie = `navbar=${JSON.stringify(state)}; expires=${date}; path=/`
}

const restoreNavBarState = (): NavBarState => {
  const rawValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('navbar='))
    ?.split('=')[1]
  if (rawValue == null)
    return { expandedExhibitGroups: [], expandedPaths: [] }
  try {
    const parsed = JSON.parse(rawValue) as NavBarState
    return {
      expandedExhibitGroups: parsed.expandedExhibitGroups ?? [],
      expandedPaths: parsed.expandedPaths ?? [],
    }
  }
  catch {
    return { expandedExhibitGroups: [], expandedPaths: [] }
  }
}

export const render = () => {
  const state = useAppSelector(s => s.componentExhibits)
  const initialState = restoreNavBarState()
  const [expandedExhibitGroups, setExpandedExhibitGroups] = useState<string[]>(initialState.expandedExhibitGroups)
  const [expandedPaths, setExpandedPaths] = useState<string[]>(initialState.expandedPaths)

  const onGroupNameClick = (groupName: string) => {
    const newExpandedExhibitGroups = expandedExhibitGroups.indexOf(groupName) === -1
      ? expandedExhibitGroups.concat(groupName)
      : expandedExhibitGroups.filter(n => n !== groupName)
    setExpandedExhibitGroups(newExpandedExhibitGroups)
    saveNavBarState({
      expandedExhibitGroups: newExpandedExhibitGroups,
      expandedPaths,
    })
  }

  const onVariantGroupExpand = (path: string) => {
    const newExpandedPaths = expandedPaths.concat(path)
    setExpandedPaths(expandedPaths.concat(path))
    saveNavBarState({
      expandedExhibitGroups,
      expandedPaths: newExpandedPaths,
    })
  }

  const onVariantGroupCollapse = (path: string) => {
    const newExpandedPaths = expandedPaths.filter(p => p !== path)
    setExpandedPaths(newExpandedPaths)
    saveNavBarState({
      expandedExhibitGroups,
      expandedPaths: newExpandedPaths,
    })
  }

  const el = useRef<HTMLDivElement>()
  const [isElFocus, setIsElFocus] = useState(false)

  useEffect(() => {
    let _isElFocus = false
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (!e.shiftKey && _isElFocus) {
          const focusableElements: (HTMLAnchorElement | HTMLButtonElement)[] = Array.from(el.current.querySelectorAll('a, button'))
          focusableElements[0]?.focus()
          e.preventDefault()
        }
        setIsElFocus(false)
        _isElFocus = false
        return
      }

      const isUp = e.key === 'ArrowUp'
      const isDown = e.key === 'ArrowDown'
      if (!isUp && !isDown)
        return

      if (!(isElFocus || el.current.contains(document.activeElement)))
        return

      const focusableElements: (HTMLAnchorElement | HTMLButtonElement)[] = Array.from(el.current.querySelectorAll('a, button'))

      let focusedElementIndex = 0
      for (let i = 0; i < focusableElements.length; i += 1) {
        if (focusableElements[i] === document.activeElement) {
          focusedElementIndex = i
          break
        }
      }

      const focusedElementIndexChange = isUp && focusedElementIndex > 0
        ? -1
        : isDown && focusedElementIndex < focusableElements.length
          ? 1
          : 0
      focusableElements[focusedElementIndex + focusedElementIndexChange]?.focus()
    }

    const onClick = (e: MouseEvent) => {
      const isEl = e.target === el.current
      _isElFocus = isEl
      setIsElFocus(isEl)
    }

    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  if (state.ready) {
    const exhibitGroupingInfo = determineExhibitGroupingInfo()

    return (
      <div
        className={`vertical-nav-bar${isElFocus ? ' focused' : ''}`}
        ref={el}
      >
        {exhibitGroupingInfo.groupNames.map(groupName => {
          const isExpanded = expandedExhibitGroups.indexOf(groupName) !== -1
          return (
            <div className={`group ${isExpanded ? 'expanded' : 'collapsed'}`}>
              <ExhibitGroupNameEl groupName={groupName} isExpanded={isExpanded} onClick={() => onGroupNameClick(groupName)} />
              {isExpanded
                ? (
                  <div className="exhibits">
                    {exhibitGroupingInfo.groupNameToExhibits[groupName].map((exhibit, i) => (
                      <ExhibitEl
                        exhibit={exhibit} key={i + 1}
                        expandedPaths={expandedPaths}
                        onGroupCollapse={n => onVariantGroupCollapse(n)}
                        onGroupExpand={n => onVariantGroupExpand(n)}
                      />
                    ))}
                  </div>
                ) : null}
            </div>
          )
        })}
        <div className="ungrouped">
          <div className="exhibits">
            {exhibitGroupingInfo.ungroupedExhibits.map((exhibit, i) => (
              <ExhibitEl
                exhibit={exhibit} key={i + 1}
                expandedPaths={expandedPaths}
                onGroupCollapse={n => onVariantGroupCollapse(n)}
                onGroupExpand={n => onVariantGroupExpand(n)}
              />
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
