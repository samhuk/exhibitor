import React from 'react'

export const render = (props: {
  isCollapsed: boolean
  onCollapseButtonClick: () => void
}) => (
  <div className="header-buttons">
    <button
      type="button"
      className={`fas ${props.isCollapsed ? 'fa-angle-up' : 'fa-angle-down'}`}
      onClick={() => props.onCollapseButtonClick()}
      aria-label="Expand all"
      title="Expand all"
    />
  </div>
)

export default render
