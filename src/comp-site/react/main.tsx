/* eslint react/jsx-filename-extension: 0 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import Component from './component'

const container = document.getElementById('exh-root')

const root = createRoot(container)

root.render(
  <Component />,
)
