import React from 'react'
import { CLASS_NAME_PREFIX } from '../exhibitor/common'

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export const NAME = 'loading-spinner'

export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`

export const render = (props: Props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <div {...props} className={`${CLASS_NAME} ${props.className ?? ''}`}>
    <div className="bars-container">
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  </div>
)

export default render
