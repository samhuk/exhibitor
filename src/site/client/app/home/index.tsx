import React from 'react'
import { Outlet } from 'react-router-dom'
import NavigatorSideBar from './navigatorSideBar'
import BottomBar from './bottomBar'

export const render = () => (
  <div className="exh-home">
    <NavigatorSideBar />
    <div className="right">
      <Outlet />
      <BottomBar />
    </div>
  </div>
)

export default render
