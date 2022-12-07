import React from 'react'
import { Outlet } from 'react-router-dom'
import VerticalNavBar from './verticalNavBar'
import BottomBar from './bottomBar'

export const render = () => (
  <div className="exh-home">
    <VerticalNavBar />
    <div className="right">
      <Outlet />
      <BottomBar />
    </div>
  </div>
)

export default render
