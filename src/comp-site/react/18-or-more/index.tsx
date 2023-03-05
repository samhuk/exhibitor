import React from 'react'
import { createRoot } from 'react-dom/client'
import { ReactCompSiteWithHooks } from '../compSiteWithHooks'
// eslint-disable-next-line import/no-unresolved
import 'index.exh.ts'

const container = document.getElementById('exh-root')

const root = createRoot(container)

root.render(<ReactCompSiteWithHooks />)
