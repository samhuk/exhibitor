import React from 'react'
import { render } from 'react-dom'
import { ReactCompSiteWithHooks } from '../common/compSiteWithHooks'
// eslint-disable-next-line import/no-unresolved
import 'index.exh.ts'

const container = document.getElementById('exh-root')

render(<ReactCompSiteWithHooks />, container)
