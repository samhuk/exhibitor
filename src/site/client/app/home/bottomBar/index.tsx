import React, { useEffect } from 'react'
import { batch, useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { useAppSelector } from '../../../store'
import { BottomBarType, selectBottomBar } from '../../../store/componentExhibits/actions'
import { getSelectedVariant } from '../componentExhibit'

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
  console.log(selectedVariantPathFound, barTypeFromQuery, selectedBarType)

  // Ensure that the selected bar type from redux and search params agree
  useEffect(() => {
    if (!selectedVariantPathFound || (selectedBarType != null && selectedBarType === barTypeFromQuery))
      return

    if (selectedBarType == null && barTypeFromQuery != null) {
      dispatch(selectBottomBar(barTypeFromQuery))
    }
    else if (selectedBarType != null && barTypeFromQuery == null) {
      setSearchParams({ [SEARCH_PARAM_NAME]: barTypeToName[DEFAULT_BAR_TYPE] })
    }
    else if (selectedBarType == null && barTypeFromQuery == null) {
      batch(() => {
        setSearchParams({ [SEARCH_PARAM_NAME]: barTypeToName[DEFAULT_BAR_TYPE] })
        dispatch(selectBottomBar(DEFAULT_BAR_TYPE))
      })
    }
    else if (selectedBarType !== barTypeFromQuery) {
      setSearchParams({ [SEARCH_PARAM_NAME]: barTypeToName[selectedBarType] })
    }
  }, [barTypeFromQuery, selectedVariantPathFound, selectedBarType])

  // Wait until a variant is selected and the bar types agree
  if (!selectedVariantPathFound || barTypeFromQuery !== selectedBarType)
    return null

  const resolvedInfo = getSelectedVariant(selectedVariantPath)

  if (resolvedInfo.success === false)
    return null

  return (
    <div className="bottom-bar">
      <div className="nav">
        {resolvedInfo.exhibit.hasProps
          ? (
            <>
              <button type="button" onClick={() => dispatch(selectBottomBar(BottomBarType.Props))}>Props</button>
              {resolvedInfo.exhibit.eventPropsSelector != null
                ? (
                  <button type="button" onClick={() => dispatch(selectBottomBar(BottomBarType.EventLog))}>Event Log</button>
                ) : null}
            </>
          ) : null}
      </div>
      {barNameFromQuery} for {resolvedInfo.exhibit.name} - {resolvedInfo.variant.name}
    </div>
  )
}

export default render
