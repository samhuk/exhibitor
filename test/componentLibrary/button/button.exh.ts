import exhibit from '../../../src/api'
import Button, { ButtonColor, ButtonSize, IconPosition } from './button'

export const buttonExhibit = exhibit(Button, 'Button')
  .events({
    onClick: true,
  })
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
  .variant('yellow', p => ({
    ...p,
    color: ButtonColor.YELLOW,
  }))
  .variant('red', p => ({
    ...p,
    color: ButtonColor.RED,
  }))
  .variant('blue', p => ({
    ...p,
    color: ButtonColor.BLUE,
  }))
  .variant('large', p => ({
    ...p,
    size: ButtonSize.LARGE,
  }))
  .variant('with icon', p => ({
    ...p,
    iconName: 'paper-plane',
    text: 'Send',
  }))
  .build()
