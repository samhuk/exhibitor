import React, { useState } from 'react'
import exhibit from '../src/api'
import './fullSizePageTest.scss'

const Component = () => {
  const [count, setCount] = useState(0)

  return (
    <div className="cl-full-size-page-test">
      <div className="header">
        <div className="title">
          Full-Size Page Test
        </div>
      </div>
      <div className="body-container">
        <div className="body">
          <div className="counter">
            <button type="button" onClick={() => setCount(count + 1)}>Click to add 1</button>
            <div>Count: {count}</div>
          </div>
        </div>
      </div>
      <div className="header">
        [Full-Size Page Test Footer]
      </div>
    </div>
  )
}

exhibit(Component, 'Full-Size Page Test')
  .options({ group: 'Test' })
  .build()
