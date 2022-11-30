import './toast.scss'

import React, { MouseEventHandler } from 'react'

import IconButton from '../iconButton/iconButton'
import TypedIcon, { IconType } from '../icons/typedIcon'
import Ternary from '../util/ternary'

export enum ToastType {
  SUCCESS = 'success',
  WARN = 'warn',
  ERROR = 'error',
  INFO = 'info'
}

type Props = {
  /**
   * Optional toast text.
   */
  text: string
  /**
   * Type of the toast, i.e. success, warn, error, info, etc.
   */
  type: ToastType
  /**
   * Default
   */
  showCloseButton?: boolean
  onCloseButtonClick?: MouseEventHandler
}

const toastTypeToTitle: { [k in ToastType]: string } = {
  [ToastType.SUCCESS]: 'Success',
  [ToastType.WARN]: 'Warning',
  [ToastType.ERROR]: 'Error',
  [ToastType.INFO]: 'Info',
}

const toastTypeToIconType: { [k in ToastType]: IconType } = {
  [ToastType.SUCCESS]: IconType.SUCCESS,
  [ToastType.WARN]: IconType.WARN,
  [ToastType.ERROR]: IconType.ERROR,
  [ToastType.INFO]: IconType.INFO,
}

export const render = (props: Props) => (
  <div className={`cl-toast type-${props.type}`}>
    <TypedIcon type={toastTypeToIconType[props.type]} className="type-icon" />
    <div className="title-text-container">
      <div className="title">{toastTypeToTitle[props.type]}</div>
      <div className="text">{props.text}</div>
    </div>
    <Ternary
      bool={props.showCloseButton ?? false}
      t={<IconButton iconName="xmark" onClick={props.onCloseButtonClick} title="Close" className="close-button" />}
    />
  </div>
)

export default render
