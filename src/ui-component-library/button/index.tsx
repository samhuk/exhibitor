import React, { forwardRef } from 'react'
import { CLASS_NAME_PREFIX } from '../common'
import Icon, { Props as IconProps } from '../icon'

export type Props = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
  & React.RefAttributes<HTMLButtonElement>
  & {
    icon?: {
      name: string
      type?: IconProps['iconType']
    }
  }

export const NAME = 'button'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`
export const DEFAULT_PROPS: Props = {
  type: 'button',
}

export const render = forwardRef<HTMLButtonElement, Props>((props, ref) => (
  // eslint-disable-next-line react/jsx-props-no-spreading, react/button-has-type, react/prop-types
  <button ref={ref} {...props} type={props.type ?? DEFAULT_PROPS.type} className={`${CLASS_NAME} ${props.children != null ? 'has-non-icon-content' : ''} ${props.className ?? ''}`}>
    {props.icon != null ? <Icon iconName={props.icon.name} iconType={props.icon.type} /> : null}
    {props.children ?? null}
  </button>
))

export default render
