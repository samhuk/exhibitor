import React, { useMemo, useState } from 'react'
import { PropModifier, PropModifierType } from '../../../../../../api/exhibit/propModifier/types'
import { ComponentExhibit, Variant } from '../../../../../../api/exhibit/types'
import Select, { SelectOption } from '../../../../../../ui-component-library/select'
import TextInput from '../../../../../../ui-component-library/text-input'

const SelectPropModifierEl = (props: {
  variant: Variant
  selectPropModifier: PropModifier<any, PropModifierType.SELECT>
  onChange: (newProps: any) => void
}) => {
  const initialSelectedValue = props.selectPropModifier.init(props.variant.props)
  const selectOptions: SelectOption[] = props.selectPropModifier.options.map(option => (Array.isArray(option)
    ? ({ value: option[0], displayText: option.length > 1 ? option[1] : option[0] })
    : ({ value: option, displayText: option })))
  const initialSelectedOption = selectOptions.find(o => o.value === initialSelectedValue)

  const [selectedOption, setSelectedOption] = useState<{ forVariant: Variant, option: SelectOption }>({
    forVariant: props.variant,
    option: initialSelectedOption,
  })

  if (selectedOption.forVariant !== props.variant) {
    setSelectedOption({
      forVariant: props.variant,
      option: initialSelectedOption,
    })
  }

  return (
    <div className="prop-modifier">
      <Select
        label={props.selectPropModifier.label}
        selectedOption={selectedOption.option}
        options={selectOptions}
        onChange={(newValue, newSelectedOption) => {
          props.onChange(props.selectPropModifier.apply(newValue, props.variant.props))
          setSelectedOption({
            forVariant: props.variant,
            option: newSelectedOption,
          })
        }}
      />
    </div>
  )
}

const TextInputPropModifierEl = (props: {
  variant: Variant
  textInputPropModifier: PropModifier<any, PropModifierType.TEXT_INPUT>
  onChange: (newProps: any) => void
}) => {
  const initialValue = useMemo(() => props.textInputPropModifier.init(props.variant.props), [props.variant])
  const [value, setValue] = useState<{ forVariant: Variant, value: string }>({
    forVariant: props.variant,
    value: initialValue,
  })

  if (value.forVariant !== props.variant) {
    setValue({
      forVariant: props.variant,
      value: initialValue,
    })
  }

  return (
    <div className="prop-modifier">
      <TextInput
        label={props.textInputPropModifier.label}
        value={value.value}
        onChange={newValue => {
          props.onChange(props.textInputPropModifier.apply(newValue, props.variant.props))
          setValue({
            forVariant: props.variant,
            value: newValue,
          })
        }}
      />
    </div>
  )
}

const PropModifierEl = (props: {
  variant: Variant
  propModifier: PropModifier
  onChange: (newProps: any) => void
}) => {
  switch (props.propModifier.type) {
    case PropModifierType.SELECT:
      return (
        <SelectPropModifierEl
          variant={props.variant}
          selectPropModifier={props.propModifier}
          onChange={props.onChange}
        />
      )
    case PropModifierType.TEXT_INPUT:
      return (
        <TextInputPropModifierEl
          variant={props.variant}
          textInputPropModifier={props.propModifier}
          onChange={props.onChange}
        />
      )
    default:
      return null
  }
}

const dispatchCustomEvent = <
  TEl extends EventTarget,
>(el: TEl, eventName: string, data?: any) => {
  el.dispatchEvent(new CustomEvent(eventName, {
    detail: data,
  }))
}

export const render = (props: {
  exhibit: ComponentExhibit<true>
  variant: Variant
  onChange: (newProps: any) => void
}) => {
  const onChange = (newProps: any): void => {
    const iframeEl = document.getElementsByTagName('iframe')[0]
    if (iframeEl == null)
      return
    dispatchCustomEvent(iframeEl.contentWindow, 'variant-props-change', newProps)
    props.onChange(newProps)
  }

  return (
    <div className="prop-modifiers">
      {props.exhibit.propModifiers.map(propModifier => (
        <PropModifierEl variant={props.variant} propModifier={propModifier} onChange={onChange} />
      ))}
    </div>
  )
}

export default render
