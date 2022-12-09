import React, { useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'

import { ComponentExhibit } from '../../../../../api/exhibit/types'
import { useAppSelector } from '../../../store'
import { BottomBarType, selectBottomBar } from '../../../store/componentExhibits/actions'
import { getSelectedVariant } from '../componentExhibit'
import EventLogComponent from './eventLog'
import PropsComponent from './props'

const barTypeToName: Record<BottomBarType, string> = {
  [BottomBarType.Props]: 'Props',
  [BottomBarType.EventLog]: 'Event Log',
}

const barNameToType: Record<string, BottomBarType> = {
  Props: BottomBarType.Props,
  'Event Log': BottomBarType.EventLog,
}

const SEARCH_PARAM_NAME = 'bar'
const DEFAULT_BAR_TYPE = BottomBarType.Props

export const render = () => {
  const selectedBarType = useAppSelector(s => s.componentExhibits.selectedBottomBarType)
  const selectedVariantPath = useAppSelector(s => s.componentExhibits.selectedVariantPath)
  const selectedVariantPathFound = useAppSelector(s => s.componentExhibits.selectedVariantPathFound)
  const [searchParams, setSearchParams] = useSearchParams()
  const dispatch = useDispatch()
  const barNameFromQuery = searchParams.get(SEARCH_PARAM_NAME)
  const barTypeFromQuery = barNameToType[barNameFromQuery]
  const doBarTypesDisagree = !selectedVariantPathFound || barTypeFromQuery !== selectedBarType
  const resolvedInfo = useMemo(() => getSelectedVariant(selectedVariantPath), [selectedVariantPath?.join('/')])
  const shownBarTypes: BottomBarType[] = []
  const showProps = resolvedInfo.success === true && resolvedInfo.exhibit.hasProps
  const showEventLog = showProps && (resolvedInfo.exhibit as ComponentExhibit<true>).eventProps
  if (showProps)
    shownBarTypes.push(BottomBarType.Props)
  if (showEventLog)
    shownBarTypes.push(BottomBarType.EventLog)

  // Ensure that the selected bar type from redux and search params agree
  useEffect(() => {
    if (!selectedVariantPathFound || (selectedBarType === barTypeFromQuery && shownBarTypes.indexOf(selectedBarType) !== -1))
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

  // Wait until a variant is selected and the bar types agree
  if (doBarTypesDisagree || resolvedInfo.success === false)
    return null

  return (
    <div className="bottom-bar">
      <div className="nav">
        {showProps ? (
          <button type="button" onClick={() => dispatch(selectBottomBar(BottomBarType.Props))} className={`${selectedBarType === BottomBarType.Props ? 'active' : ''}`}>Props</button>
        ) : null}
        {showEventLog ? (
          <button type="button" onClick={() => dispatch(selectBottomBar(BottomBarType.EventLog))} className={`${selectedBarType === BottomBarType.EventLog ? 'active' : ''}`}>Event Log</button>
        ) : null}
      </div>
      {(() => {
        switch (selectedBarType) {
          case BottomBarType.Props:
            return <PropsComponent exhibit={resolvedInfo.exhibit as ComponentExhibit<true>} variant={resolvedInfo.variant} />
          case BottomBarType.EventLog:
            return <EventLogComponent exhibit={resolvedInfo.exhibit as ComponentExhibit<true>} variant={resolvedInfo.variant} />
          default:
            return null
        }
      })()}
    </div>
  )
}

export default render
