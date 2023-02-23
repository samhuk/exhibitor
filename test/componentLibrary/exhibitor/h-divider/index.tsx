import React from 'react'
import { CLASS_NAME_PREFIX } from '../common'

export const NAME = 'h-divider'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`
export const DEFAULT_PROPS: Props = { }

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export const render = (props: Props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <div {...props} className={`${CLASS_NAME} ${props.className ?? ''}`} />
)

export default render
