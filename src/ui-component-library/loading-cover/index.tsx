import React from 'react'
import { CLASS_NAME_PREFIX } from '../common'

export type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
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
  animationType?: 'flip'
}

export const NAME = 'loading-cover'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`
export const DEFAULT_PROPS: Props = {
  iconType: 's',
  iconName: '',
  animationType: 'flip',
}

const render = (props: Props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading, react/button-has-type
  <div {...props} className={`${CLASS_NAME} ${props.className ?? ''}`}>
    <div className="modal">
      <i className={`fa${props.iconType ?? DEFAULT_PROPS.iconType} fa-${props.iconName ?? DEFAULT_PROPS.iconName} fa-${props.animationType ?? DEFAULT_PROPS.animationType}`} />
    </div>
  </div>
)

export default render
