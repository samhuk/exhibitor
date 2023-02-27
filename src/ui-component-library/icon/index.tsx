import React from 'react'
import { CLASS_NAME_PREFIX } from '../common'

export type Props = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLElement>, HTMLElement> & {
  /**
   * Name of the icon, i.e. `user`, `home`, etc.
   */
  iconName: string
  /**
   * The type of the icon.
   * * `s` - solid
   * * `r` - regular
   * * `b` - brands
   */
  iconType?: 's' | 'r' | 'b'
}

export const NAME = 'icon'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`
export const DEFAULT_PROPS: Props = {
  iconType: 's',
  iconName: '',
}

export const render = (props: Props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading, react/button-has-type
  <i {...props} className={`fa${props.iconType ?? DEFAULT_PROPS.iconType} fa-${props.iconName ?? props.iconName} ${CLASS_NAME} ${props.className ?? ''}`}>
    {props.children ?? null}
  </i>
)

export default render
