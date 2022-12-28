import React from 'react'
import { NPM_PACKAGE_CAPITALIZED_NAME } from '../../../common/name'

export const render = () => (
  <div className="exh-header">
    <div className="title">
      {NPM_PACKAGE_CAPITALIZED_NAME}
    </div>
    <div className="right">
      <div className="about">
        React: v{React.version}
      </div>
    </div>
  </div>
)

export default render
