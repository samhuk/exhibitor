import React, { KeyboardEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { applyWorkingViewportSize, updateWorkingViewportSize } from '../../../store/componentExhibits/actions'

export const render = () => {
  const dispatch = useAppDispatch()
  const workingSize = useAppSelector(s => s.componentExhibits.workingViewportRectSizePx)

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter')
      return

    dispatch(applyWorkingViewportSize())
  }

  const onBlur = () => {
    dispatch(applyWorkingViewportSize())
  }

  const onWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateWorkingViewportSize({
      height: workingSize.height,
      width: parseInt(e.target.value),
    }))
  }

  const onHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateWorkingViewportSize({
      height: parseInt(e.target.value),
      width: workingSize.width,
    }))
  }

  return (
    <div className="viewport-info-bar">
      <input
        type="number"
        onChange={onWidthChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        value={workingSize.width}
      />
      <div className="dimensions-seperator"><i className="fas fa-xmark" /></div>
      <input
        type="number"
        onChange={onHeightChange}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        value={workingSize.height}
      />
    </div>
  )
}

export default render
