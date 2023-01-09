import React from 'react'
import { createRoot } from 'react-dom/client'
import { ReactCompSiteWithHooks } from '../common'

const container = document.getElementById('exh-root')

const root = createRoot(container)

root.render(<ReactCompSiteWithHooks />)
