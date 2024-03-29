import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { ExhibitNode, ExhibitNodeType, PathTree } from '../../../../../api/exhibit/types'
import { useAppSelector } from '../../../store'
import { LoadingState } from '../../../store/types'
import ExhibitGroupEl from './exhibitGroup'
import VariantGroupEl from './variantGroup'
import VariantEl from './variant'
import { createTopLevelElFocusEffect } from './topLevelElFocusEffect'
import { getDefaultWidthPx, restoreNavBarState, saveNavBarState } from './persistence'
import { createResizer, ResizerLocation } from '../../../common/resizer'
import { NavBarState } from './types'
import Button from '../../../../../ui-component-library/button'

type GroupTypeNode = ExhibitNode<ExhibitNodeType.EXHIBIT_GROUP | ExhibitNodeType.VARIANT_GROUP>

const PathTreeEl = (props: {
  pathTree: PathTree
  expandedPaths: { [path: string]: boolean }
  onDirExpansionChange: (node: GroupTypeNode, isExpanded: boolean) => void
  onVariantNodeSelect: () => void
}) => (
  <>
    {Object.entries(props.pathTree).map(([path, childPathTree]) => {
      const node = exh.nodes[path]
      const isExpanded = props.expandedPaths[node.path] === true

      let NodeEl: ReactNode

      if (node.type === ExhibitNodeType.EXHIBIT_GROUP) {
        NodeEl = (
          <ExhibitGroupEl
            node={node}
            isExpanded={isExpanded}
            onClick={() => props.onDirExpansionChange(node as GroupTypeNode, !isExpanded)}
          />
        )
      }
      else if (node.type === ExhibitNodeType.VARIANT_GROUP) {
        NodeEl = (
          <VariantGroupEl
            node={node}
            isExpanded={isExpanded}
            onClick={() => props.onDirExpansionChange(node as GroupTypeNode, !isExpanded)}
          />
        )
      }
      else {
        NodeEl = <VariantEl node={node} onSelect={() => props.onVariantNodeSelect()} />
      }

      return (
        <>
          {NodeEl}
          {(!isExpanded || typeof childPathTree === 'boolean')
            ? null
            : (
              <PathTreeEl
                pathTree={childPathTree}
                expandedPaths={props.expandedPaths}
                onDirExpansionChange={props.onDirExpansionChange}
                onVariantNodeSelect={props.onVariantNodeSelect}
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
  const widthPxRef = useRef(initialState?.widthPx ?? getDefaultWidthPx())

  const [el, setEl] = useState<HTMLElement>(null)
  const isElFocus = useRef(false)

  const toggleExpanded = () => {
    el.classList.toggle('expanded')
  }

  const collapse = () => el.classList.remove('expanded')

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

  const updateExpandedPaths = (value: { [path: string]: boolean }) => {
    setExpandedPaths(value)
    saveNavBarState({
      widthPx: widthPxRef.current,
      expandedPaths: value,
    })
  }

  const onGroupDirExpansionChange = (node: ExhibitNode, newIsExpanded: boolean) => {
    const newExpandedPaths = { ...expandedPaths }
    if (newIsExpanded)
      newExpandedPaths[node.path] = true
    else
      delete newExpandedPaths[node.path]

    updateExpandedPaths(newExpandedPaths)
  }

  const onExpandAllButtonClick = () => {
    const newExpandedPaths: { [path: string]: boolean } = {}
    Object.keys(exh.nodes).forEach(path => newExpandedPaths[path] = true)
    updateExpandedPaths(newExpandedPaths)
  }

  const onCollapseAllButtonClick = () => updateExpandedPaths({})

  const onCollapseAllNonExhibitGroupButtonClick = () => {
    const newExpandedPaths: { [path: string]: boolean } = {}

    Object.entries(exh.nodes)
      .filter(([path, node]) => node.type === ExhibitNodeType.EXHIBIT_GROUP)
      .forEach(([path]) => newExpandedPaths[path] = true)

    updateExpandedPaths(newExpandedPaths)
  }

  return (
    <>
      <div className="navigator-side-bar-toggle-expanded-button">
        <Button title="Toggle component navigator" icon={{ name: 'bars' }} onClick={toggleExpanded} />
      </div>
      <div className="navigator-side-bar" ref={setEl}>
        <div className="button-bar-1">
          <Button
            onClick={() => onExpandAllButtonClick()}
            aria-label="Expand all"
            title="Expand all"
            icon={{ name: 'square-plus', type: 'r' }}
          />
          <Button
            onClick={() => onCollapseAllButtonClick()}
            aria-label="Collapse all"
            title="Collapse all"
            icon={{ name: 'square-minus', type: 'r' }}
          />
          <Button
            onClick={() => onCollapseAllNonExhibitGroupButtonClick()}
            aria-label="Collapse variant groups"
            title="Collapse variant groups"
            icon={{ name: 'layer-group' }}
          />
        </div>
        <div className="nodes">
          <PathTreeEl
            pathTree={exh.pathTree}
            expandedPaths={expandedPaths}
            onDirExpansionChange={onGroupDirExpansionChange}
            onVariantNodeSelect={collapse}
          />
        </div>
      </div>
    </>
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
