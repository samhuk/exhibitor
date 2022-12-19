import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ExhibitNode, ExhibitNodeType, PathTree } from '../../../../../api/exhibit/types'
import { useAppSelector } from '../../../store'
import { LoadingState } from '../../../store/types'
import ExhibitGroupEl from './exhibitGroup'
import VariantGroupEl from './variantGroup'
import VariantEl from './variant'
import { createTopLevelElFocusEffect } from './topLevelElFocusEffect'
import { DEFAULT_WIDTH_PX, NavBarState, restoreNavBarState, saveNavBarState } from './persistence'
import { createResizer, ResizerLocation } from '../../../common/resizer'
import { createTopLevelElResizableEffect } from './resizableEffect'

const NodeEl = (props: {
  node: ExhibitNode
  isExpanded: boolean
  onClick: () => void
}) => {
  if (props.node.type === ExhibitNodeType.EXHIBIT_GROUP)
    return <ExhibitGroupEl node={props.node} isExpanded={props.isExpanded} onClick={props.onClick} />
  if (props.node.type === ExhibitNodeType.VARIANT_GROUP)
    return <VariantGroupEl node={props.node} isExpanded={props.isExpanded} onClick={props.onClick} />
  if (props.node.type === ExhibitNodeType.VARIANT)
    return <VariantEl node={props.node} />
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
  const initialState: NavBarState = !hasRestoredNavBarState.current ? restoreNavBarState() : null
  hasRestoredNavBarState.current = true

  const [expandedPaths, setExpandedPaths] = useState<{ [path: string]: boolean }>(initialState?.expandedPaths)
  const widthPxRef = useRef(initialState?.widthPx ?? DEFAULT_WIDTH_PX)

  const [el, setEl] = useState<HTMLElement>(null)
  const isElFocus = useRef(false)

  const onResizeFinish = (newWidthPx: number) => {
    widthPxRef.current = newWidthPx
    saveNavBarState({
      widthPx: newWidthPx,
      expandedPaths,
    })
  }

  useEffect(createTopLevelElFocusEffect(el, isElFocus), [el, expandedPaths])

  const resizer = useMemo(() => createResizer({
    el,
    side: ResizerLocation.RIGHT,
    initialSizePx: widthPxRef.current,
    onResizeFinish,
    sizeChangeScale: 1,
    minSizePx: 100,
  }), [el])

  useEffect(resizer, [el])

  const onGroupDirExpansionChange = (node: ExhibitNode, newIsExpanded: boolean) => {
    const newExpandedPaths = { ...expandedPaths }
    if (newIsExpanded)
      newExpandedPaths[node.path] = true
    else
      delete newExpandedPaths[node.path]

    setExpandedPaths(newExpandedPaths)
    saveNavBarState({
      widthPx: widthPxRef.current,
      expandedPaths,
    })
  }

  const onExpandAllButtonClick = () => {
    const newExpandedPaths: { [path: string]: boolean } = {}
    Object.keys(exh.nodes).forEach(path => newExpandedPaths[path] = true)

    setExpandedPaths(newExpandedPaths)
    saveNavBarState({
      widthPx: widthPxRef.current,
      expandedPaths: newExpandedPaths,
    })
  }

  const onCollapseAllButtonClick = () => {
    const newExpandedPaths = {}

    setExpandedPaths(newExpandedPaths)
    saveNavBarState({
      widthPx: widthPxRef.current,
      expandedPaths: newExpandedPaths,
    })
  }

  return (
    <div className="navigator-side-bar" ref={setEl}>
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
    return <div className="navigator-nav-bar">Loading exhibits...</div>

  if (loadingState === LoadingState.FAILED)
    return <div className="navigator-nav-bar">Loading exhibits failed</div>

  return null
}

export default render
