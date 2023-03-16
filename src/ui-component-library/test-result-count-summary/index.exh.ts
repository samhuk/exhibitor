import exhibit, { simpleNumberInputModifier } from '../../api'
import Component, { DEFAULT_PROPS, NAME } from '.'
import { GROUP_NAME } from '../common'

export const testResultCountSummaryExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .defaults(DEFAULT_PROPS)
  .events({
    onClick: true,
  })
  .propModifiers([
    simpleNumberInputModifier('numFail'),
    simpleNumberInputModifier('numPass'),
    simpleNumberInputModifier('numSkip'),
  ])
  .variant('0 skipped', {
    numFail: 2,
    numPass: 1,
  })
  .variant('All >0', {
    numFail: 1,
    numPass: 2,
    numSkip: 3,
  })
  .variant('All 0', {
    numFail: 0,
    numPass: 0,
    numSkip: 0,
  })
  .build()
