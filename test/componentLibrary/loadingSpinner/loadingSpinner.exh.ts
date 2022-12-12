import exhibit from '../../../src/api'
import LoadingSpinner from './loadingSpinner'

export const loadingSpinnerExhibit = exhibit(LoadingSpinner, 'LoadingSpinner', { group: 'Design Phase' })
  .build()
