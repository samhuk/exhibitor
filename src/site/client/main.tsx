/* eslint react/jsx-filename-extension: 0 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import App from './app'
import store from './store'


const container = document.getElementById('exh-root')

const root = createRoot(container)

root.render(
  <Provider store={store}>
    <App />
  </Provider>,
)
