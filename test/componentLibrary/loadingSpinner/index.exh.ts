import exhibit from '../../../src/api'
import LoadingSpinner, { NAME } from '.'

export const loadingSpinnerExhibit = exhibit(LoadingSpinner, NAME)
  .options({
    group: 'Test Component Library',
  })
  .defaults({})
  .build()
