import './typedIcon.scss'

import exhibit from '../../../src/api'
import TypedIcon, { IconType } from './typedIcon'

exhibit(TypedIcon, 'TypedIcon')
  .defaults({
    type: IconType.INFO,
  })
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
