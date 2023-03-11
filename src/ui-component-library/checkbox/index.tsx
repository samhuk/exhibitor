import { OmitTyped } from '@samhuk/type-helpers'
import React, { useState } from 'react'
import { CLASS_NAME_PREFIX } from '../common'

type Props = OmitTyped<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'onChange'> & {
  label?: string
  value?: boolean
  onChange?: (value: boolean) => void
  className?: string
}

export const NAME = 'checkbox'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`

export const render = (props: Props) => {
  const [value, setValue] = useState(props.value ?? false)

  /* If a value has been provided in the props, then we will ensure
   * that our value stays up-to-date with the one provided.
   *
   * If it isn't provided, then we have complete free-will and will essentially
   * be using only our own useState to store the current value.
   */
  const isValueProvided = 'value' in props
  if (isValueProvided && value !== props.value)
    setValue(props.value)

  const updateValue = (newValue: boolean) => {
    setValue(newValue)
    props.onChange?.(newValue)
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div className={`${CLASS_NAME} ${props.className ?? ''}`}>
      {props.label != null
        // eslint-disable-next-line max-len
        // eslint-disable-next-line jsx-a11y/label-has-associated-control, jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        ? <label onClick={() => updateValue(!value)}>{props.label}</label>
        : null}
      <input placeholder={props.placeholder} type="checkbox" checked={value} onChange={e => updateValue((e.target as HTMLInputElement).checked)} />
    </div>
  )
}

export default render
