import './typedIcon.scss'

import exhibit from '../../../src/api'
import TypedIcon, { IconType } from './typedIcon'

export const typedIconExhibit = exhibit(TypedIcon, 'TypedIcon', { group: 'GA' })
  .variant('Success', {
    type: IconType.SUCCESS,
  })
  .variant('Warn', {
    type: IconType.WARN,
  })
  .variant('Error', {
    type: IconType.ERROR,
  })
  .variant('Info', {
    type: IconType.INFO,
  })
  .build()
