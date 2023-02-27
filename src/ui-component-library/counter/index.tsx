import React from 'react'
import { CLASS_NAME_PREFIX } from '../common'

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  count: number
}

export const NAME = 'counter'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`
export const DEFAULT_PROPS: Props = {
  count: 0,
}

export const render = (props: Props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <span {...props} className={`${CLASS_NAME} ${props.className ?? ''}`}>
    {props.count ?? DEFAULT_PROPS.count}
  </span>
)

export default render
