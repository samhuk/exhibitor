import { OmitTyped } from '@samhuk/type-helpers'
import React, { useMemo, useState } from 'react'
import { CLASS_NAME_PREFIX } from '../common'

type Props = OmitTyped<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'onChange'> & {
  /**
   * @default 'int'
   */
  numberType?: 'int' | 'float'
  min?: number
  max?: number
  /**
   * @default 1
   */
  step?: number
  label?: string
  value?: number
  onChange?: (value: number) => void
  className?: string
  placeholder?: string
}

export const NAME = 'number-input'
export const CLASS_NAME = `${CLASS_NAME_PREFIX}-${NAME}`

export const render = (props: Props) => {
  const numberType = useMemo(() => props.numberType ?? 'int', [props.numberType])
  const defaultValueToRevertTo = useMemo(() => props.min ?? 0, [props.min])
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
    if (newValue == null || newValue === '') {
      setValue(defaultValueToRevertTo)
      props.onChange?.(defaultValueToRevertTo)
      return
    }
    const parsedNewValue = numberType === 'int' ? Number.parseInt(newValue) : Number.parseFloat(newValue)
    if (Number.isNaN(parsedNewValue)) {
      setValue(defaultValueToRevertTo)
      props.onChange?.(defaultValueToRevertTo)
      return
    }
    setValue(parsedNewValue)
    props.onChange?.(parsedNewValue)
  }

  return (
    <div className={`${CLASS_NAME} ${props.className ?? ''}`}>
      {props.label != null
        // eslint-disable-next-line jsx-a11y/label-has-associated-control
        ? <label>{props.label}</label>
        : null}
      <input
        placeholder={props.placeholder}
        min={props.min}
        max={props.max}
        step={props.step ?? 1}
        type="number"
        value={value}
        onInput={e => updateValue((e.target as HTMLInputElement).value)}
      />
    </div>
  )
}

export default render
