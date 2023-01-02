import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../store'
import { toggleViewportSizeChangeEnabled } from '../../../store/componentExhibits/actions'

export const render = (props: {
  isCollapsed: boolean
  onCollapseButtonClick: () => void
}) => {
  const dispatch = useAppDispatch()
  const isViewportUnlocked = useAppSelector(s => s.componentExhibits.viewportSizeChangeEnabled)

  const onUnlockViewportCheckboxChange = () => {
    dispatch(toggleViewportSizeChangeEnabled())
  }

  return (
    <div className="header-buttons">
      <button
        type="button"
        className={`unlock-viewport-button fas fa-tablet-screen-button${isViewportUnlocked ? ' active' : ''}`}
        aria-label="Unlock viewport"
        title="Unlock viewport"
        onClick={onUnlockViewportCheckboxChange}
      />
      <button
        type="button"
        className={`toggle-collapse-button fas ${props.isCollapsed ? 'fa-angle-up' : 'fa-angle-down'}`}
        onClick={() => props.onCollapseButtonClick()}
        aria-label="Expand all"
        title="Expand all"
      />
    </div>
  )
}

export default render
