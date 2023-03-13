import exhibit from '../../api'
import Component, { DEFAULT_PROPS, NAME } from '.'
import { GROUP_NAME } from '../common'

export const vDividerExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .defaults(DEFAULT_PROPS)
  .events({
    onClick: true,
  })
  .build()
