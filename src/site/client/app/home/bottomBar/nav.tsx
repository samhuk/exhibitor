import React, { useMemo } from 'react'
import { ComponentExhibit, ExhibitNodeType } from '../../../../../api/exhibit/types'
import { useAppDispatch, useAppSelector } from '../../../store'
import { BottomBarType, selectBottomBar } from '../../../store/componentExhibits/actions'

export const render = () => {
  const selectedVariantPath = useAppSelector(s => s.componentExhibits.selectedVariantPath)
  const selectedType = useAppSelector(s => s.componentExhibits.selectedBottomBarType)
  const hasUnseenEvents = useAppSelector(s => s.componentExhibits.hasUnseenEvents)
  const dispatch = useAppDispatch()
  const selectedVariant = useMemo(
    () => {
      const selectedNode = exh.nodes[selectedVariantPath]
      return selectedNode != null && selectedNode.type === ExhibitNodeType.VARIANT
        ? selectedNode
        : null
    },
    [selectedVariantPath],
  )
  const showProps = selectedVariant != null && selectedVariant.exhibit.hasProps
  const showEventLog = showProps && (selectedVariant.exhibit as ComponentExhibit<true>).eventProps

  return (
    <div className="nav">
      {showProps ? (
        <button type="button" onClick={() => dispatch(selectBottomBar(BottomBarType.Props))} className={`${selectedType === BottomBarType.Props ? 'active' : ''}`}>
          Props
        </button>
      ) : null}
      {showEventLog ? (
        <button type="button" onClick={() => dispatch(selectBottomBar(BottomBarType.EventLog))} className={`${selectedType === BottomBarType.EventLog ? 'active' : ''}`}>
          Event Log {hasUnseenEvents ? <div className="has-unseen-indicator" /> : null}
        </button>
      ) : null}
    </div>
  )
}

export default render
