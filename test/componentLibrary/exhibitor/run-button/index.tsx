import { OmitTyped } from '@samhuk/type-helpers'
import React from 'react'
import Button, { Props as ButtonProps } from '../button'
import { CLASS_NAME_PREFIX } from '../common'

type Props = OmitTyped<ButtonProps, 'icon'>

export const NAME = 'run-button'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`
export const DEFAULT_PROPS: Props = { }

export const render = (props: Props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Button className={`${CLASS_NAME} ${props.className ?? ''}`} icon={{ name: 'play' }} {...props} />
)

export default render
