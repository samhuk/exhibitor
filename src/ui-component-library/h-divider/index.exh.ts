import exhibit from '../../api/react'
import Component, { DEFAULT_PROPS, NAME } from '.'
import { GROUP_NAME } from '../common'

export const hDividerExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .defaults(DEFAULT_PROPS)
  .events({
    onClick: true,
  })
  .build()
