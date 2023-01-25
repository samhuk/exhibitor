import React from 'react'

// TODO: JSDoc, expand options to more than just icon name
const render = (props: { iconName: string }) => (
  <div className="cl-loading-cover">
    <div className="modal">
      <i className={`fas fa-${props.iconName} fa-flip`} />
    </div>
  </div>
)

export default render
