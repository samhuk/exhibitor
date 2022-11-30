import exhibit from '../../../src/api'
import { ButtonColor } from '../button/button'
import IconButton from './iconButton'

exhibit(IconButton, 'IconButton')
  .defaults({
    onClick: () => undefined,
    iconName: 'user',
    color: ButtonColor.DEFAULT,
  })
  .variant('paper-plane', p => ({
    ...p, iconName: 'paper-plane',
  }))
  .build()
