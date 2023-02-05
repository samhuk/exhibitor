import React from 'react'

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>

export const render = (props: Props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <div {...props} className={`cl-h-divider ${props.className}`} />
)

export default render
