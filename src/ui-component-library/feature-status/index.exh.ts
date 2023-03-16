import exhibit, { simpleSelectModifier, simpleTextInputModifier } from '../../api'
import Component, { DEFAULT_PROPS, FeatureStatus, NAME } from '.'
import { GROUP_NAME } from '../common'

export const featureStatusExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .defaults(DEFAULT_PROPS)
  .events({
    onClick: true,
  })
  // .tests('e2e.spec.ts')
  .propModifiers([
    simpleTextInputModifier('featureName'),
    simpleSelectModifier('status', [FeatureStatus.ALPHA, FeatureStatus.BETA]),
  ])
  .variant('Alpha', {
    featureName: '[Feature name]',
    status: FeatureStatus.ALPHA,
  })
  .variant('Beta', {
    featureName: '[Feature name]',
    status: FeatureStatus.BETA,
  })
  .build()
