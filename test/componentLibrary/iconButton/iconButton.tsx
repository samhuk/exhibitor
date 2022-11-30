import { OmitTyped } from '@samhuk/type-helpers'
import React, { MouseEventHandler } from 'react'

enum ButtonColor {
  RED = 'red',
  YELLOW = 'yellow',
  GREEN = 'green',
  BLUE = 'blue',
  DEFAULT = 'default',
}

enum ButtonSize {
  NORMAL = 'normal',
  LARGE = 'large',
}

type Props = {
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
   * Name of icon to place inside button.
   */
  iconName: string
  onClick: MouseEventHandler
  additionalProps?: OmitTyped<React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, 'onClick' | 'className'>
  className?: string
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
  const ariaLabel = props.title ?? props.iconName ?? ''
  const type = props.additionalProps?.type ?? 'button'

  const color = props.color ?? ButtonColor.DEFAULT

  const onClick: MouseEventHandler = e => {
    if (!props.disabled)
      props.onClick(e)
  }

  return (
    <button
      className={`cl-button icon-button color-${color} size-${props.size ?? ButtonSize.NORMAL} ${props.className ?? ''}`}
      disabled={props.disabled ?? false}
      aria-label={ariaLabel}
      // eslint-disable-next-line react/button-has-type
      type={type}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props.additionalProps}
      onClick={onClick}
    >
      <i className={`fas fa-${props.iconName}`} />
    </button>
  )
}

export default render
