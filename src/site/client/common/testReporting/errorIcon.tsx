import React from 'react'

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export const render = (props: Props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <i {...props} className={`cl-error-icon far fa-circle-xmark ${props.className}`} />
)

export default render
