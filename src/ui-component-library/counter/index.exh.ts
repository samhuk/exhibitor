import exhibit, { simpleNumberInputModifier } from '../../api'
import Component, { DEFAULT_PROPS, NAME } from '.'
import { GROUP_NAME } from '../common'

export const counterExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .defaults(DEFAULT_PROPS)
  .events({
    onClick: true,
  })
  .tests('e2e.spec.ts')
  .propModifiers([
    simpleNumberInputModifier('count'),
  ])
  .variant('5', {
    count: 5,
  })
  .variant('50', {
    count: 50,
  })
  .variant('500', {
    count: 500,
  })
  .variant('5000', {
    count: 5000,
  })
  .build()
