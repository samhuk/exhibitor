import { OmitTyped } from '@samhuk/type-helpers'
import React, { useState } from 'react'
import { CLASS_NAME_PREFIX } from '../common'

type Props = OmitTyped<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'onChange'> & {
  label?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  placeholder?: string
}

export const NAME = 'text-input'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`

export const render = (props: Props) => {
  const [value, setValue] = useState(props.value)

  /* If a value has been provided in the props, then we will ensure
   * that our value stays up-to-date with the one provided.
   *
   * If it isn't provided, then we have complete free-will and will essentially
   * be using only our own useState to store the current value.
   */
  const isValueProvided = 'value' in props
  if (isValueProvided && value !== props.value)
    setValue(props.value)

  const updateValue = (newValue: string) => {
    setValue(newValue)
    props.onChange?.(newValue)
  }

  return (
    <div className={`${CLASS_NAME} ${props.className ?? ''}`}>
      {props.label != null
        ? <label>{props.label}</label>
        : null}
      <input placeholder={props.placeholder} type="text" value={value} onInput={e => updateValue((e.target as HTMLInputElement).value)} />
    </div>
  )
}

export default render
