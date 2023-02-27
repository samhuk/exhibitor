import { OmitTyped } from '@samhuk/type-helpers'
import React from 'react'
import Icon, { Props as IconProps } from '../icon'
import { CLASS_NAME_PREFIX } from '../common'

type Props = OmitTyped<IconProps, 'iconName' | 'iconType'>

export const NAME = 'error-icon'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`
export const DEFAULT_PROPS: Props = { }

export const render = (props: Props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Icon className={`${CLASS_NAME} ${props.className ?? ''}`} iconName="circle-xmark" iconType="r" {...props} />
)

export default render
