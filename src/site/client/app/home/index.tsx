import React from 'react'
import { Outlet } from 'react-router-dom'
import VerticalNavBar from './verticalNavBar'
import VerticalNavBar2 from './verticalNavBar/index2'
import BottomBar from './bottomBar'

export const render = () => (
  <div className="exh-home">
    <VerticalNavBar />
    <VerticalNavBar2 />
    <div className="right">
      <Outlet />
      <BottomBar />
    </div>
  </div>
)

export default render
