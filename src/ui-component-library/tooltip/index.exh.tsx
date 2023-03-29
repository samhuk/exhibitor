import React from 'react'
import exhibit from '../../api/react'
import Component, { DEFAULT_PROPS, NAME } from '.'
import { GROUP_NAME } from '../common'
import Button from '../button'

export const featureStatusExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .defaults(DEFAULT_PROPS)
  // .tests('e2e.spec.ts')
  .variant('Basic test', {
    referenceEl: <Button>Hello!</Button>,
    tooltipEl: () => (<div>TOOLTIP!</div>),
  })
  .build()
