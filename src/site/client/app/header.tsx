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
      <button type="button" onClick={() => {
        const el = document.querySelector('#styles-link') as any
        el.href = el.getAttribute('href') === '/light.css' ? '/dark.css' : '/light.css'
      }}
      >TOGGLE DARK MODE! :D
      </button>
    </div>
  </div>
)

export default render
