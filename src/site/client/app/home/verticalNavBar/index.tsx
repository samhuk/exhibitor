import React, { useEffect, useMemo, useRef, useState } from 'react'

import { ComponentExhibit, Variant, VariantGroup } from '../../../../../api/exhibit/types'
import { NavLinkKeeyQuery } from '../../../common/navLinkKeepQuery'
import Ternary from '../../../common/ternary'
import { useAppSelector } from '../../../store'
import { LoadingState } from '../../../store/types'

/* This is early PoC code for the vertical nav side bar. It's my first time making one
 * with React so it's not in a high-quality state with concerns separated and such at the moment.
 * TODO: Improve this. See note above.
 *
 * This also should probably be completely rewritten. VSCode doesn't nest their components but
 * rather has a flat list, and they are quite a bit smarter. The state management of these
 * nested components is getting very difficult to work with, and I see now why this is a bad idea.
 */

const VariantEl = (
  props: {
    path: string
    variant: Variant
  },
) => (
  <NavLinkKeeyQuery
    to={props.path != null ? `${props.path}/${encodeURIComponent(props.variant.name)}` : encodeURIComponent(props.variant.name)}
    onKeyDown={e => {
      if (e.key === ' ')
        (e.target as HTMLElement).click()
    }}
  >
    <i className="far fa-file" />
    <span className="name">{props.variant.name}</span>
  </NavLinkKeeyQuery>
)

const VariantGroupEl = (props: {
  exhibit: ComponentExhibit<true>
  variantGroup: VariantGroup
  path?: string
  id: string|number
  isTopLevel?: boolean
  expandedPaths: string[]
  onExpandChange: (path: string, newIsExpanded: boolean) => void
}) => {
  const isExpandedFromProps = props.expandedPaths.indexOf(props.path) !== -1
  const isExpanded = useRef(isExpandedFromProps)
  if (isExpandedFromProps !== isExpanded.current)
    isExpanded.current = isExpandedFromProps

  const onGroupNameClick = () => {
    props.onExpandChange(props.path, !isExpanded.current)
    isExpanded.current = !isExpanded.current
  }

  return (
    <div key={props.id} className="variant-group">
      <button type="button" className="name" onClick={() => onGroupNameClick()}>
        <i className={`fas ${isExpanded.current ? 'fa-angle-down' : 'fa-angle-right'}`} />
        <div className="text">{props.variantGroup.name}</div>
      </button>
      {isExpanded.current
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
                  id={i + 1}
                  exhibit={props.exhibit}
                  variantGroup={variantGroup}
                  path={props.path != null ? `${props.path}/${encodeURIComponent(variantGroup.name)}` : encodeURIComponent(variantGroup.name)}
                  isTopLevel={false}
                  expandedPaths={props.expandedPaths}
                  onExpandChange={props.onExpandChange}
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
  id: string | number
  expandedPaths: string[]
  onExpandChange: (path: string, newIsExpanded: boolean) => void
}) => (
  props.exhibit.hasProps
    ? (
      <VariantGroupEl
        exhibit={props.exhibit}
        variantGroup={props.exhibit}
        path={props.exhibit.name}
        id={props.id}
        expandedPaths={props.expandedPaths}
        onExpandChange={props.onExpandChange}
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
  document.cookie = `navbar=${JSON.stringify(state)}; expires=${date}; path=/; SameSite=Lax`
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
      expandedExhibitGroups: [...new Set(parsed.expandedExhibitGroups)] ?? [],
      expandedPaths: [...new Set(parsed.expandedPaths)] ?? [],
    }
  }
  catch {
    return { expandedExhibitGroups: [], expandedPaths: [] }
  }
}

const determineAllPathsOfVariantGroup = (group: VariantGroup, path: string): string[] => {
  const encodedGroupName = encodeURIComponent(group.name)
  const thisPath = path != null ? `${path}/${encodedGroupName}` : encodedGroupName
  return [thisPath]
    // .concat(Object.values(group.variants).map(v => `${thisPath}/${encodeURIComponent(v.name)}`))
    .concat(Object.values(group.variantGroups).reduce<string[]>((acc, g) => acc.concat(determineAllPathsOfVariantGroup(g, thisPath)), []))
}

const determineAllPaths = () => (
  exh.default
    .filter(e => e.hasProps)
    .reduce<string[]>((acc, exhibit) => (
      acc.concat(determineAllPathsOfVariantGroup(exhibit as ComponentExhibit<true>, null))
    ), [])
)

export const render = () => {
  const readyState = useAppSelector(s => s.componentExhibits.ready)
  const loadingState = useAppSelector(s => s.componentExhibits.loadingState)

  // Restore the nav bar state from cookies once. I think we can just do this in the redux store code instead.
  const hasRestoredNavBarState = useRef(false)
  const initialState = !hasRestoredNavBarState.current ? restoreNavBarState() : null
  hasRestoredNavBarState.current = true

  const [expandedExhibitGroups, setExpandedExhibitGroups] = useState<string[]>(initialState?.expandedExhibitGroups)
  const [expandedPaths, setExpandedPaths] = useState<string[]>(initialState?.expandedPaths)
  const exhibitGroupingInfo = useMemo(() => (readyState ? determineExhibitGroupingInfo() : null), [readyState ? exh.default : null])
  const el = useRef<HTMLDivElement>()
  const isElFocus = useRef(false)

  const onGroupNameClick = (groupName: string) => {
    const currentlyExpanded = expandedExhibitGroups.indexOf(groupName) !== -1
    const newExpandedExhibitGroups = currentlyExpanded
      ? expandedExhibitGroups.filter(n => n !== groupName)
      : expandedExhibitGroups.concat(groupName)
    setExpandedExhibitGroups(newExpandedExhibitGroups)
    saveNavBarState({
      expandedExhibitGroups: newExpandedExhibitGroups,
      expandedPaths,
    })
  }

  const onVariantGroupExpandChange = (path: string, newIsExpanded: boolean) => {
    const isPathExpanded = expandedPaths.indexOf(path) !== -1
    const newExpandedPaths = newIsExpanded && !isPathExpanded
      ? expandedPaths.concat(path)
      : !newIsExpanded && isPathExpanded
        ? expandedPaths.filter(p => p !== path)
        : expandedPaths
    setExpandedPaths(newExpandedPaths)
    saveNavBarState({
      expandedExhibitGroups,
      expandedPaths: newExpandedPaths,
    })
  }

  const onExpandAllButtonClick = () => {
    const allPaths = determineAllPaths()
    setExpandedExhibitGroups(exhibitGroupingInfo.groupNames)
    setExpandedPaths(allPaths)
    saveNavBarState({
      expandedExhibitGroups: exhibitGroupingInfo.groupNames,
      expandedPaths: allPaths,
    })
  }

  const onCollapseAllButtonClick = () => {
    setExpandedExhibitGroups([])
    setExpandedPaths([])
    saveNavBarState({
      expandedExhibitGroups: [],
      expandedPaths: [],
    })
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (!e.shiftKey && isElFocus.current) {
          const focusableElements: (HTMLAnchorElement | HTMLButtonElement)[] = Array.from(el.current.querySelectorAll('a, button'))
          focusableElements[0]?.focus()
          e.preventDefault()
        }
        el.current.classList.remove('focused')
        isElFocus.current = false
        return
      }

      const isUp = e.key === 'ArrowUp'
      const isDown = e.key === 'ArrowDown'
      if (!isUp && !isDown)
        return

      if (!(isElFocus.current || el.current.contains(document.activeElement)))
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
      isElFocus.current = isEl
      el.current.classList.toggle('focused', isEl)
    }

    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  if (readyState) {
    return (
      <div
        className="vertical-nav-bar"
        ref={el}
      >
        <div className="button-bar-1">
          <button type="button" className="far fa-square-plus" onClick={() => onExpandAllButtonClick()} aria-label="Expand all" title="Expand all" />
          <button type="button" className="far fa-square-minus" onClick={() => onCollapseAllButtonClick()} aria-label="Collapse all" title="Collapse all" />
        </div>
        {exhibitGroupingInfo.groupNames.map((groupName, i) => {
          const isExpanded = expandedExhibitGroups.indexOf(groupName) !== -1
          return (
            <div className={`group ${isExpanded ? 'expanded' : 'collapsed'}`} key={i + 1}>
              <ExhibitGroupNameEl groupName={groupName} isExpanded={isExpanded} onClick={() => onGroupNameClick(groupName)} />
              {isExpanded
                ? (
                  <div className="exhibits">
                    {exhibitGroupingInfo.groupNameToExhibits[groupName].map((exhibit, _i) => (
                      <ExhibitEl
                        exhibit={exhibit}
                        key={_i + 1}
                        id={_i + 1}
                        expandedPaths={expandedPaths}
                        onExpandChange={onVariantGroupExpandChange}
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
                exhibit={exhibit}
                key={i + 1}
                id={i + 1}
                expandedPaths={expandedPaths}
                onExpandChange={onVariantGroupExpandChange}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (loadingState === LoadingState.FETCHING)
    return <div className="vertical-nav-bar">Loading exhibits...</div>

  if (loadingState === LoadingState.FAILED)
    return <div className="vertical-nav-bar">Loading exhibits failed</div>

  return null
}

export default render
