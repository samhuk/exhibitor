import App from './app'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import React from 'react'
import { applyNewThemeToIndexHtml } from './store/theme/reducer'
import { createRoot } from 'react-dom/client'
import { getTheme } from './connectors/theme'
import store from './store'

applyNewThemeToIndexHtml(getTheme())

const container = document.getElementById('exh-root')

const root = createRoot(container)

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
)
