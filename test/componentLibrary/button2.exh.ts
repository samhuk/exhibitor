import exhibit from '../../src/api'
import Button2, { ButtonColor, ButtonSize, IconPosition } from './button2'

exhibit('Button2', Button2)
  .events(p => ({
    onClick: p.onClick,
  }))
  .defaults({
    onClick: () => undefined,
    color: ButtonColor.DEFAULT,
    iconPosition: IconPosition.LEFT,
    text: 'Button Text (button 2!)',
    size: ButtonSize.NORMAL,
    disabled: false,
  })
  .variant('default (2)', p => p)
  .variant('green (2)', p => ({
    ...p,
    color: ButtonColor.RED,
  }))
  .build()
