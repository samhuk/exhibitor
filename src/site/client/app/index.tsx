import '../assets/styles/standard.scss'

import React from 'react'

import { useAppSelector } from '../store'
import Header from './header'

// styles
const ComponentExhibits = () => {
  const componentExhibits = useAppSelector(s => s.componentExhibits)

  if (!componentExhibits.ready)
    return <div>Waiting for component exhibits to load...</div>

  return (
    <div>
      {exh.default.map(exhibit => (
        exhibit.variants.map((variant, i) => (
          <div key={i + 1}>
            <div>{variant.name}</div>
            <div>{exhibit.renderFn(variant.props)}</div>
          </div>
        ))
      ))}
    </div>
  )
}

export const App = () => {

  return (
    <div className="exh-app">
      <Header />
      <ComponentExhibits />
    </div>
  )
}

export default App
