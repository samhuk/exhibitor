import exhibit from '../../api'
import Component, { DEFAULT_PROPS, FeatureStatus, NAME } from '.'
import { GROUP_NAME } from '../common'

export const featureStatusExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .defaults(DEFAULT_PROPS)
  .events({
    onClick: true,
  })
  // .tests('e2e.spec.ts')
  .variant('Alpha', {
    featureName: '[Feature name]',
    status: FeatureStatus.ALPHA,
  })
  .variant('Beta', {
    featureName: '[Feature name]',
    status: FeatureStatus.BETA,
  })
  .build()
