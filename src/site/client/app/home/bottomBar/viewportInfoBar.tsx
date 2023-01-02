import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { changeViewport } from '../../../store/componentExhibits/actions'

export const render = () => {
  const dispatch = useAppDispatch()
  const state = useAppSelector(s => s.componentExhibits.viewportRectSizePx)
  const onWidthChange = (newWidthPx: number) => {
    dispatch(changeViewport({
      height: state.height,
      width: newWidthPx,
    }))
  }
  const onHeightChange = (newHeightPx: number) => {
    dispatch(changeViewport({
      height: newHeightPx,
      width: state.width,
    }))
  }

  return (
    <div className="viewport-info-bar">
      <input type="number" onChange={e => onWidthChange(parseInt(e.target.value))} />
      <div className="dimensions-seperator">x</div>
      <input type="number" onChange={e => onHeightChange(parseInt(e.target.value))} />
    </div>
  )
}

export default render
