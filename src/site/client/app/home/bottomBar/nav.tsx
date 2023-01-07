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
  const showTests = true // TODO
  const showCode = true // TODO

  return (
    <div className="nav">
      {showProps ? (
        <button type="button" onClick={() => dispatch(selectBottomBar(BottomBarType.Props))} className={`${selectedType === BottomBarType.Props ? 'active' : ''}`} title="View variant props">
          Props
        </button>
      ) : null}
      {showEventLog ? (
        <button type="button" onClick={() => dispatch(selectBottomBar(BottomBarType.EventLog))} className={`${selectedType === BottomBarType.EventLog ? 'active' : ''}`} title="View event log">
          Event Log {hasUnseenEvents ? <div className="has-unseen-indicator" /> : null}
        </button>
      ) : null}
      {/* {showTests ? (
        <button type="button" onClick={() => undefined} className={`${selectedType === BottomBarType.EventLog ? 'active' : ''}`}>
          Tests
        </button>
      ) : null} */}
      {showCode ? (
        <button type="button" onClick={() => dispatch(selectBottomBar(BottomBarType.Code))} className={`${selectedType === BottomBarType.Code ? 'active' : ''}`} title="View exhibit code">
          <i className="fas fa-code" />
        </button>
      ) : null}
    </div>
  )
}

export default render
