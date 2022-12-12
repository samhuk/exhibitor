import React, { EffectCallback, MutableRefObject, useEffect, useRef, useState } from 'react'
import { ExhibitNode, ExhibitNodeType, PathTree } from '../../../../../api/exhibit/types'
import { NavLinkKeeyQuery } from '../../../common/navLinkKeepQuery'
import { useAppSelector } from '../../../store'
import { LoadingState } from '../../../store/types'

type NavBarState = {
  expandedPaths: { [path: string]: boolean }
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
    return { expandedPaths: {} }
  try {
    const parsed = JSON.parse(rawValue) as NavBarState
    if (typeof parsed !== 'object')
      return { expandedPaths: {} }

    return { expandedPaths: parsed.expandedPaths }
  }
  catch {
    return { expandedPaths: {} }
  }
}

const createTopLevelElFocusEffect = (
  elRef: MutableRefObject<HTMLDivElement>,
  isElFocusRef: MutableRefObject<boolean>,
): EffectCallback => () => {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (!e.shiftKey && isElFocusRef.current) {
        const focusableElements: (HTMLAnchorElement | HTMLButtonElement)[] = Array.from(elRef.current.querySelectorAll('a, button'))
        focusableElements[0]?.focus()
        e.preventDefault()
      }
      elRef.current.classList.remove('focused')
      isElFocusRef.current = false
      return
    }

    const isUp = e.key === 'ArrowUp'
    const isDown = e.key === 'ArrowDown'
    if (!isUp && !isDown)
      return

    if (!(isElFocusRef.current || elRef.current.contains(document.activeElement)))
      return

    const focusableElements: (HTMLAnchorElement | HTMLButtonElement)[] = Array.from(elRef.current.querySelectorAll('a, button'))

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
    const isEl = e.target === elRef.current
    isElFocusRef.current = isEl
    elRef.current.classList.toggle('focused', isEl)
  }

  document.addEventListener('click', onClick)
  document.addEventListener('keydown', onKeyDown)
  return () => {
    document.removeEventListener('click', onClick)
    document.removeEventListener('keydown', onKeyDown)
  }
}

const indentationPx = 8

const calcNodePaddingLeft = (node: ExhibitNode) => (
  (indentationPx * (node.pathComponents.length - 1))
)

const VariantNodeEl = (props: {
  node: ExhibitNode<ExhibitNodeType.VARIANT>
}) => (
  <NavLinkKeeyQuery
    to={props.node.path}
    onKeyDown={e => {
      if (e.key === ' ')
        (e.target as HTMLElement).click()
    }}
    className="variant"
    style={{ paddingLeft: calcNodePaddingLeft(props.node) }}
  >
    <i className="far fa-file" />
    <span className="name">{props.node.variant.name}</span>
  </NavLinkKeeyQuery>
)

const VariantGroupNodeEl = (props: {
  node: ExhibitNode<ExhibitNodeType.VARIANT_GROUP>
  isExpanded: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    className="variant-group"
    style={{ paddingLeft: calcNodePaddingLeft(props.node) }}
    onClick={props.onClick}
  >
    <i className={`fas ${props.isExpanded ? 'fa-angle-down' : 'fa-angle-right'}`} />
    <div className="text">{props.node.variantGroup.name}</div>
  </button>
)

const ExhibitGroupNodeEl = (props: {
  node: ExhibitNode<ExhibitNodeType.EXHIBIT_GROUP>
  isExpanded: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    className="exhibit-group"
    style={{ paddingLeft: calcNodePaddingLeft(props.node) }}
    onClick={props.onClick}
  >
    <i className={`fas ${props.isExpanded ? 'fa-angle-down' : 'fa-angle-right'}`} />
    <div className="text">{props.node.groupName}</div>
  </button>
)

const NodeEl = (props: {
  node: ExhibitNode
  isExpanded: boolean
  onClick: () => void
}) => {
  if (props.node.type === ExhibitNodeType.EXHIBIT_GROUP)
    return <ExhibitGroupNodeEl node={props.node} isExpanded={props.isExpanded} onClick={props.onClick} />
  if (props.node.type === ExhibitNodeType.VARIANT_GROUP)
    return <VariantGroupNodeEl node={props.node} isExpanded={props.isExpanded} onClick={props.onClick} />
  if (props.node.type === ExhibitNodeType.VARIANT)
    return <VariantNodeEl node={props.node} />
  return null
}

type GroupTypeNode = ExhibitNode<ExhibitNodeType.EXHIBIT_GROUP | ExhibitNodeType.VARIANT_GROUP>

const PathTreeEl = (props: {
  pathTree: PathTree
  expandedPaths: { [path: string]: boolean }
  onDirExpansionChange: (node: GroupTypeNode, isExpanded: boolean) => void
}) => (
  <>
    {Object.entries(props.pathTree).map(([path, childPathTree]) => {
      const node = exh.nodes[path]
      const isExpanded = props.expandedPaths[node.path] === true
      return (
        <>
          <NodeEl node={node} isExpanded={isExpanded} onClick={() => props.onDirExpansionChange(node as GroupTypeNode, !isExpanded)} />
          {(!isExpanded || typeof childPathTree === 'boolean')
            ? null
            : (
              <PathTreeEl
                pathTree={childPathTree}
                expandedPaths={props.expandedPaths}
                onDirExpansionChange={props.onDirExpansionChange}
              />
            )}
        </>
      )
    })}
  </>
)

const Render = () => {
  // Restore the nav bar state from cookies once. I think we can just do this in the redux store code instead.
  const hasRestoredNavBarState = useRef(false)
  const initialState = !hasRestoredNavBarState.current ? restoreNavBarState() : null
  hasRestoredNavBarState.current = true

  const [expandedPaths, setExpandedPaths] = useState<{ [path: string]: boolean }>(initialState?.expandedPaths)

  const el = useRef<HTMLDivElement>()
  const isElFocus = useRef(false)

  useEffect(createTopLevelElFocusEffect(el, isElFocus), [])

  const onGroupDirExpansionChange = (node: ExhibitNode, newIsExpanded: boolean) => {
    if (newIsExpanded)
      expandedPaths[node.path] = true
    else
      delete expandedPaths[node.path]
    setExpandedPaths({ ...expandedPaths })
    saveNavBarState({
      expandedPaths,
    })
  }

  const onExpandAllButtonClick = () => {
    const newExpandedPaths: { [path: string]: boolean } = {}
    Object.keys(exh.nodes).forEach(path => newExpandedPaths[path] = true)
    setExpandedPaths(newExpandedPaths)
    saveNavBarState({
      expandedPaths: newExpandedPaths,
    })
  }

  const onCollapseAllButtonClick = () => {
    const newExpandedPaths: { [path: string]: boolean } = {}
    setExpandedPaths(newExpandedPaths)
    saveNavBarState({
      expandedPaths: newExpandedPaths,
    })
  }

  return (
    <div className="navigator-side-bar" ref={el}>
      <div className="button-bar-1">
        <button
          type="button"
          className="far fa-square-plus"
          onClick={() => onExpandAllButtonClick()}
          aria-label="Expand all"
          title="Expand all"
        />
        <button
          type="button"
          className="far fa-square-minus"
          onClick={() => onCollapseAllButtonClick()}
          aria-label="Collapse all"
          title="Collapse all"
        />
      </div>
      <div className="nodes">
        <PathTreeEl pathTree={exh.pathTree} expandedPaths={expandedPaths} onDirExpansionChange={onGroupDirExpansionChange} />
      </div>
    </div>
  )
}

export const render = () => {
  const readyState = useAppSelector(s => s.componentExhibits.ready)
  const loadingState = useAppSelector(s => s.componentExhibits.loadingState)

  if (readyState)
    return <Render />

  if (loadingState === LoadingState.FETCHING)
    return <div className="vertical-nav-bar">Loading exhibits...</div>

  if (loadingState === LoadingState.FAILED)
    return <div className="vertical-nav-bar">Loading exhibits failed</div>

  return null
}

export default render
