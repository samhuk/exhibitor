import React from 'react'
import Button from '../../../../../ui-component-library/button'
import { useAppDispatch, useAppSelector } from '../../../store'
import { toggleViewportSizeChangeEnabled } from '../../../store/componentExhibits/actions'

export const render = (props: {
  isCollapsed: boolean
  onCollapseButtonClick: () => void
}) => {
  const dispatch = useAppDispatch()
  const isViewportUnlocked = useAppSelector(s => s.componentExhibits.viewportSizeChangeEnabled)

  return (
    <div className="header-buttons">
      <Button
        className={`unlock-viewport-button ${isViewportUnlocked ? ' active' : ''}`}
        icon={{ name: 'tablet-screen-button' }}
        title={isViewportUnlocked ? 'Lock Viewport' : 'Unlock Viewport'}
        onClick={() => dispatch(toggleViewportSizeChangeEnabled())}
      />
      <Button
        className={`toggle-collapse-button ${isViewportUnlocked ? ' active' : ''}`}
        icon={{ name: props.isCollapsed ? 'angle-up' : 'angle-down' }}
        title={props.isCollapsed ? 'Expand Panel' : 'Minimize Panel'}
        onClick={() => props.onCollapseButtonClick()}
      />
    </div>
  )
}

export default render
