import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { useAppSelector } from '../store'

import Header from './header'
import Home from './home'
import ComponentExhibit from './home/componentExhibit'

export const App = () => {
  const isCompLibReady = useAppSelector(s => s.componentExhibits.ready)

  return isCompLibReady ? (
    <div className="exh-app">
      <Header />
      <Routes>
        <Route path="" element={<Home />}>
          <Route path="" element={<ComponentExhibit />} />
          <Route path="*" element={<ComponentExhibit />} />
        </Route>
      </Routes>
    </div>
  ) : <div className="exh-app loading"><i className="fas fa-spinner fa-spin" /></div>
}

export default App
