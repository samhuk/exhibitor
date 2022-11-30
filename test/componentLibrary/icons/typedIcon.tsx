import React from 'react'

export enum IconType {
  SUCCESS = 'success',
  WARN = 'warn',
  ERROR = 'error',
  INFO = 'info',
}

type Props = {
  type: IconType
  className?: string
}

const iconTypeToIconName: { [k in IconType]: string } = {
  [IconType.SUCCESS]: 'circle-check',
  [IconType.WARN]: 'circle-exclamation',
  [IconType.ERROR]: 'circle-xmark',
  [IconType.INFO]: 'circle-info',
}

export const render = (props: Props) => (
  <i className={`cl-typed-icon ${props.type} fas fa-${iconTypeToIconName[props.type]} ${props.className ?? ''}`} />
)

export default render
