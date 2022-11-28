import '../assets/styles/standard.scss'

import React from 'react'

import Header from './header'
import { Routes, Route } from 'react-router-dom'
import Home from './home'
import { ComponentExhibit } from './home/componentExhibit'

export const App = () => {

  return (
    <div className="exh-app">
      <Header />
      <Routes>
        <Route path="" element={<Home />}>
          <Route path=":name" element={<ComponentExhibit />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
