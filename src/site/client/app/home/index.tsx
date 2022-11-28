import React from 'react'
import { Outlet } from 'react-router-dom'
import VerticalNavBar from './verticalNavBar'

export const render = () => (
  <div className="exh-home">
    <VerticalNavBar />
    <div className="right">
      <Outlet />
    </div>
  </div>
)

export default render
