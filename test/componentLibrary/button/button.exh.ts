import exhibit from '../../../src/api'
import Button, { ButtonColor, ButtonSize, IconPosition } from './button'

exhibit(Button, 'Button')
  .events(p => ({
    onClick: p.onClick,
  }))
  .defaults({
    onClick: () => undefined,
    color: ButtonColor.DEFAULT,
    iconPosition: IconPosition.LEFT,
    text: 'Button Text',
    size: ButtonSize.NORMAL,
    disabled: false,
  })
  .variant('green', p => ({
    ...p,
    color: ButtonColor.GREEN,
  }))
  .build()
