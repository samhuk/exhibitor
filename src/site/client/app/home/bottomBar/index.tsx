import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'

import { ComponentExhibit, ExhibitNodeType, VariantExhibitNode } from '../../../../../api/exhibit/types'
import { useAppSelector } from '../../../store'
import { BottomBarType, selectBottomBar } from '../../../store/componentExhibits/actions'
import EventLogComponent from './eventLog'
import { DEFAULT_STATE, restoreState, saveState, State } from './persistence'
import PropsComponent from './props'
import CodeComponent from './code'
import AxeComponent from './axe'
import Nav from './nav'
import HeaderRhs from './headerRhs'
import { createResizer, ResizerLocation } from '../../../common/resizer'
import ViewportInfoBar from './viewportInfoBar'

const barTypeToName: Record<BottomBarType, string> = {
  [BottomBarType.Props]: 'Props',
  [BottomBarType.EventLog]: 'Event Log',
  [BottomBarType.Code]: 'Code',
  [BottomBarType.axe]: 'axe',
}

const barNameToType: Record<string, BottomBarType> = {
  Props: BottomBarType.Props,
  'Event Log': BottomBarType.EventLog,
  Code: BottomBarType.Code,
  axe: BottomBarType.axe,
}

const SEARCH_PARAM_NAME = 'bar'
const DEFAULT_BAR_TYPE = BottomBarType.Props

export const render = () => {
  // Restore state from cookies once. I think we can just do this in the redux store code instead.
  const hasRestoredState = useRef(false)
  const initialState: State = !hasRestoredState.current ? restoreState() : null
  hasRestoredState.current = true

  const viewportSizeChangeEnabled = useAppSelector(s => s.componentExhibits.viewportSizeChangeEnabled)

  const dispatch = useDispatch()
  const selectedBarType = useAppSelector(s => s.componentExhibits.selectedBottomBarType)
  const selectedVariantPath = useAppSelector(s => s.componentExhibits.selectedVariantPath)
  const [searchParams, setSearchParams] = useSearchParams()

  const heightPxRef = useRef(initialState?.heightPx ?? DEFAULT_STATE.heightPx)
  const [isCollapsed, setIsCollapsed] = useState(initialState?.isCollapsed ?? DEFAULT_STATE.isCollapsed)

  const barNameFromQuery = searchParams.get(SEARCH_PARAM_NAME)
  const barTypeFromQuery = barNameToType[barNameFromQuery]
  const shownBarTypes: BottomBarType[] = []
  const variantNode = useMemo<VariantExhibitNode>(
    () => {
      const selectedNode = exh.nodes[selectedVariantPath]
      return selectedNode != null && selectedNode.type === ExhibitNodeType.VARIANT
        ? selectedNode
        : null
    },
    [selectedVariantPath],
  )
  const showProps = variantNode != null && variantNode.exhibit.hasProps
  const showEventLog = showProps && (variantNode.exhibit as ComponentExhibit<true>).eventProps
  const showCode = variantNode != null // TODO
  const showAxe = variantNode != null // TODO
  if (showProps)
    shownBarTypes.push(BottomBarType.Props)
  if (showEventLog)
    shownBarTypes.push(BottomBarType.EventLog)
  if (showCode)
    shownBarTypes.push(BottomBarType.Code)
  if (showAxe)
    shownBarTypes.push(BottomBarType.axe)

  const elRef = useRef<HTMLDivElement>()

  // Ensure that the selected bar type from redux and search params agree
  useEffect(() => {
    if (selectedVariantPath == null || (selectedBarType === barTypeFromQuery && shownBarTypes.indexOf(selectedBarType) !== -1))
      return

    let prospectiveNewBarType: BottomBarType
    // Bar type in query but not in redux
    if (selectedBarType == null && barTypeFromQuery != null)
      prospectiveNewBarType = barTypeFromQuery
    // Bar type in redux but not in query
    else if (selectedBarType != null && barTypeFromQuery == null)
      prospectiveNewBarType = selectedBarType
    // No bar type in either redux or query, then try going to default
    else if (selectedBarType == null && barTypeFromQuery == null)
      prospectiveNewBarType = DEFAULT_BAR_TYPE
    // Bar type in redux *and* query, then prioritize redux.
    else if (selectedBarType !== barTypeFromQuery)
      prospectiveNewBarType = selectedBarType

    const newBarType = shownBarTypes.indexOf(prospectiveNewBarType) !== -1
      ? prospectiveNewBarType
      : shownBarTypes.indexOf(DEFAULT_BAR_TYPE) !== -1
        ? DEFAULT_BAR_TYPE
        : null
    const updateFns = [
      newBarType !== barTypeFromQuery
        ? () => setSearchParams({ [SEARCH_PARAM_NAME]: newBarType != null ? barTypeToName[newBarType] : undefined })
        : null,
      newBarType !== selectedBarType
        ? () => dispatch(selectBottomBar(newBarType))
        : null,
    ].filter(v => v != null)
    updateFns.forEach(fn => fn())
  }, [selectedBarType, barTypeFromQuery, selectedVariantPath])

  const onResizeFinish = (newHeightPx: number) => {
    heightPxRef.current = newHeightPx
    saveState({
      heightPx: newHeightPx,
      isCollapsed,
    })
  }

  if (elRef.current != null)
    elRef.current.style.height = isCollapsed ? '' : `${heightPxRef.current}px`

  const resizer = useMemo(() => createResizer({
    el: elRef.current,
    side: ResizerLocation.TOP,
    initialSizePx: heightPxRef.current,
    onResizeFinish,
    sizeChangeScale: 1,
    minSizePx: 100,
  }), [elRef.current])

  useEffect(resizer, [elRef.current])

  const onToggleCollapseButtonClick = () => {
    const newIsCollapsed = !isCollapsed
    setIsCollapsed(newIsCollapsed)
    saveState({
      heightPx: heightPxRef.current,
      isCollapsed: newIsCollapsed,
    })
  }

  return (
    <div className={`bottom-bar${isCollapsed ? ' collapsed' : ''}`} ref={elRef}>
      <div className="header">
        <div className="left">
          {isCollapsed ? null : <Nav />}
        </div>
        <div className="middle">
          {viewportSizeChangeEnabled ? <ViewportInfoBar /> : null}
        </div>
        <div className="right">
          <HeaderRhs isCollapsed={isCollapsed} onCollapseButtonClick={onToggleCollapseButtonClick} />
        </div>
      </div>
      {variantNode == null || isCollapsed ? null : (() => {
        switch (selectedBarType) {
          case BottomBarType.Props:
            return <PropsComponent exhibit={variantNode.exhibit as ComponentExhibit<true>} variant={variantNode.variant} />
          case BottomBarType.EventLog:
            return <EventLogComponent exhibit={variantNode.exhibit as ComponentExhibit<true>} variant={variantNode.variant} />
          case BottomBarType.Code:
            return <CodeComponent exhibit={variantNode.exhibit as ComponentExhibit<true>} variant={variantNode.variant} />
          case BottomBarType.axe:
            return <AxeComponent exhibit={variantNode.exhibit as ComponentExhibit<true>} variant={variantNode.variant} />
          default:
            return null
        }
      })()}
    </div>
  )
}

export default render
