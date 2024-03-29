import { simpleSelectModifier, simpleTextInputModifier } from '../../api'
import exhibit from '../../api/react'
import Component, { DEFAULT_PROPS, NAME } from '.'
import { GROUP_NAME } from '../common'

export const iconExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .defaults(DEFAULT_PROPS)
  .events({
    onClick: true,
  })
  // .tests('e2e.spec.ts')
  .propModifiers([
    simpleTextInputModifier('iconName'),
    simpleSelectModifier('iconType', ['r', 's', 'b']),
  ])
  .variant('house (solid)', {
    iconName: 'house',
  })
  .variant('map (regular)', {
    iconName: 'map',
    iconType: 'r',
  })
  .build()
