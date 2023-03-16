import exhibit, { simpleSelectModifier } from '../../api'
import Component, { DEFAULT_PROPS, NAME } from '.'
import { GROUP_NAME } from '../common'

export const severityIndicatorExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .defaults(DEFAULT_PROPS)
  .events({
    onClick: true,
  })
  .propModifiers([
    simpleSelectModifier('severity', [
      [0, 'Minor'],
      [1, 'Moderate'],
      [2, 'Severe'],
      [3, 'Critical'],
    ]),
  ])
  // .tests('e2e.spec.ts')
  .variant('0 (Minor)', {
    severity: 0,
  })
  .variant('1 (Moderate)', {
    severity: 1,
  })
  .variant('2 (Severe)', {
    severity: 2,
  })
  .variant('3 (Critical)', {
    severity: 3,
  })
  .build()
