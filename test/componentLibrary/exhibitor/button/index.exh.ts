import exhibit from '../../../../src/api'
import Component, { DEFAULT_PROPS, NAME } from '.'
import { GROUP_NAME } from '../common'

export const buttonExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .defaults(DEFAULT_PROPS)
  .events({
    onClick: true,
  })
  .tests('e2e.spec.ts')
  .variant('Text only', {
    children: 'Default button',
  })
  .variant('Icon only', {
    icon: {
      name: 'house',
    },
  })
  .variant('Text + Icon', {
    icon: {
      name: 'house',
    },
    children: 'Home',
  })
  .build()
