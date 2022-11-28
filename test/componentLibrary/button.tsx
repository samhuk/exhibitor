import './button.scss'

import { OmitTyped } from '@samhuk/type-helpers'
import React, { MouseEventHandler } from 'react'

import Ternary from './ternary'

export enum IconPosition {
  LEFT = 'left',
  RIGHT = 'right',
}

export enum ButtonColor {
  RED = 'red',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  DEFAULT = 'default',
}

export enum ButtonSize {
  NORMAL = 'normal',
  LARGE = 'large',
}

type Props = {
  /**
   * Optional button text.
   */
  text?: string
  /**
   * Optional title attribute value.
   *
   * By default, the aria-label will also be this value. If `title` is not
   * defined, then aria-label will use `iconName`.
   *
   * @default text
   */
  title?: string
  /**
   * Optional name of icon to place inside button.
   */
  iconName?: string
  /**
   * Optional position of the icon relative to the button text.
   *
   * @default IconPosition.LEFT
   */
  iconPosition?: IconPosition
  onClick: MouseEventHandler
  additionalProps?: OmitTyped<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'onClick'>
  /**
   * @default ButtonColor.WHITE
   */
  color?: ButtonColor
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * @default ButtonSize.NORMAL
   */
  size?: ButtonSize
}

export const render = (props: Props) => {
  const title = props.text
  const ariaLabel = title ?? props.iconName ?? ''
  const type = props.additionalProps?.type ?? 'button'

  const iconEl = props.iconName != null ? <i className={`fas fa-${props.iconName}`} /> : null
  const iconPosition = props.iconPosition ?? IconPosition.LEFT
  const color = props.color ?? ButtonColor.DEFAULT

  const onClick: MouseEventHandler = e => {
    if (!props.disabled)
      props.onClick(e)
  }

  return (
    <button
      className={`cl-button icon-${iconPosition} color-${color} size-${props.size ?? ButtonSize.NORMAL}`}
      disabled={props.disabled ?? false}
      aria-label={ariaLabel}
      // eslint-disable-next-line react/button-has-type
      type={type}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props.additionalProps}
      onClick={onClick}
    >
      <Ternary bool={iconEl != null && iconPosition === IconPosition.LEFT} t={iconEl} />
      <Ternary bool={props.text != null} t={props.text} />
      <Ternary bool={iconEl != null && iconPosition === IconPosition.RIGHT} t={iconEl} />
    </button>
  )
}

export default render
