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

  const toggleViewportButtonLabel = isViewportUnlocked ? 'Lock Viewport' : 'Unlock Viewport'
  const toggleCollapsedButtonLabel = props.isCollapsed ? 'Expand Panel' : 'Minimize Panel'

  return (
    <div className="header-buttons">
      <button
        type="button"
        className={`unlock-viewport-button fas fa-tablet-screen-button${isViewportUnlocked ? ' active' : ''}`}
        onClick={onUnlockViewportCheckboxChange}
        aria-label={toggleViewportButtonLabel}
        title={toggleViewportButtonLabel}
      />
      <button
        type="button"
        className={`toggle-collapse-button fas ${props.isCollapsed ? 'fa-angle-up' : 'fa-angle-down'}`}
        onClick={() => props.onCollapseButtonClick()}
        aria-label={toggleCollapsedButtonLabel}
        title={toggleCollapsedButtonLabel}
      />
    </div>
  )
}

export default render
