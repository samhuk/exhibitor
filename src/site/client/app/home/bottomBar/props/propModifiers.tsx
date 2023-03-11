import React, { useMemo, useState } from 'react'
import Slider from 'rc-slider'
import Handle from 'rc-slider/lib/Handles/Handle'
import { PropModifier, PropModifierType } from '../../../../../../api/exhibit/propModifier/types'
import { ComponentExhibit, Variant } from '../../../../../../api/exhibit/types'
import Button from '../../../../../../ui-component-library/button'
import Checkbox from '../../../../../../ui-component-library/checkbox'
import Select, { SelectOption } from '../../../../../../ui-component-library/select'
import TextInput from '../../../../../../ui-component-library/text-input'

const SelectPropModifierEl = (props: {
  variantProps: any
  selectPropModifier: PropModifier<any, PropModifierType.SELECT>
  onChange: (newProps: any) => void
}) => {
  const selectOptions: SelectOption[] = useMemo(() => props.selectPropModifier.options.map(option => (Array.isArray(option)
    ? ({ value: option[0], displayText: option.length > 1 ? option[1] : option[0] })
    : ({ value: option, displayText: option }))), [props.selectPropModifier.options])

  const initialValue = useMemo(() => props.selectPropModifier.init(props.variantProps), [props.selectPropModifier, props.variantProps])
  const initialSelectedOption = useMemo(() => selectOptions.find(o => o.value === initialValue), [selectOptions, initialValue])

  const [value, setValue] = useState(initialValue)
  const [selectedOption, setSelectedOption] = useState(initialSelectedOption)

  if (initialValue !== value)
    setValue(initialValue)
  if (initialSelectedOption !== selectedOption)
    setSelectedOption(initialSelectedOption)

  return (
    <div className="prop-modifier select">
      <Select
        label={props.selectPropModifier.label}
        selectedOption={selectedOption}
        options={selectOptions}
        onChange={(newValue, newSelectedOption) => {
          setSelectedOption(newSelectedOption)
          props.onChange(props.selectPropModifier.apply(newValue, props.variantProps))
        }}
      />
    </div>
  )
}

const TextInputPropModifierEl = (props: {
  variantProps: any
  textInputPropModifier: PropModifier<any, PropModifierType.TEXT_INPUT>
  onChange: (newProps: any) => void
}) => {
  const initialValue = useMemo(() => props.textInputPropModifier.init(props.variantProps), [props.textInputPropModifier, props.variantProps])
  const [value, setValue] = useState(initialValue)

  if (initialValue !== value)
    setValue(initialValue)

  return (
    <div className="prop-modifier text-input">
      <TextInput
        label={props.textInputPropModifier.label}
        value={value}
        onChange={newValue => {
          props.onChange(props.textInputPropModifier.apply(newValue, props.variantProps))
          setValue(newValue)
        }}
      />
    </div>
  )
}

const CheckboxPropModifierEl = (props: {
  variantProps: any
  checkboxPropModifier: PropModifier<any, PropModifierType.CHECKBOX>
  onChange: (newProps: any) => void
}) => {
  const initialValue = useMemo(() => props.checkboxPropModifier.init(props.variantProps), [props.checkboxPropModifier, props.variantProps])
  const [value, setValue] = useState(initialValue)

  if (initialValue !== value)
    setValue(initialValue)

  return (
    <div className="prop-modifier checkbox">
      <Checkbox
        label={props.checkboxPropModifier.label}
        value={value}
        onChange={newValue => {
          props.onChange(props.checkboxPropModifier.apply(newValue, props.variantProps))
          setValue(newValue)
        }}
      />
    </div>
  )
}

const NumberSliderTooltip = (props: {
  value: number
}) => <div title={props.value?.toString()}>{props.value}</div>

const NumberSliderPropModifierEl = (props: {
  variantProps: any
  numberSliderPropModifier: PropModifier<any, PropModifierType.NUMBER_SLIDER>
  onChange: (newProps: any) => void
}) => {
  const initialValue = useMemo(() => props.numberSliderPropModifier.init(props.variantProps), [props.numberSliderPropModifier, props.variantProps])
  const [value, setValue] = useState(initialValue)

  if (initialValue !== value)
    setValue(initialValue)

  return (
    <div className="prop-modifier number-slider">
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label>{props.numberSliderPropModifier.label}</label>
      <Slider
        min={props.numberSliderPropModifier.min}
        max={props.numberSliderPropModifier.max}
        step={props.numberSliderPropModifier.step ?? 1}
        value={value}
        // handleRender={tooltipProps => (
        //   <div {...tooltipProps.props}>
        //     <NumberSliderTooltip value={tooltipProps.props.value} />
        //   </div>
        // )}
        // eslint-disable-next-line react/no-unstable-nested-components
        handleRender={renderProps => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div {...renderProps.props}>
            <NumberSliderTooltip value={(renderProps.props as any)['aria-valuenow']} />
          </div>
        )}
        onChange={newValue => {
          const _newValue = newValue as number // Convenient cast
          props.onChange(props.numberSliderPropModifier.apply(_newValue, props.variantProps))
          setValue(_newValue)
        }}
      />
    </div>
  )
}

const PropModifierEl = (props: {
  variantProps: any
  propModifier: PropModifier
  onChange: (newProps: any) => void
}) => {
  switch (props.propModifier.type) {
    case PropModifierType.SELECT:
      return (
        <SelectPropModifierEl
          variantProps={props.variantProps}
          selectPropModifier={props.propModifier}
          onChange={props.onChange}
        />
      )
    case PropModifierType.TEXT_INPUT:
      return (
        <TextInputPropModifierEl
          variantProps={props.variantProps}
          textInputPropModifier={props.propModifier}
          onChange={props.onChange}
        />
      )
    case PropModifierType.CHECKBOX:
      return (
        <CheckboxPropModifierEl
          variantProps={props.variantProps}
          checkboxPropModifier={props.propModifier}
          onChange={props.onChange}
        />
      )
    case PropModifierType.NUMBER_SLIDER:
      return (
        <NumberSliderPropModifierEl
          variantProps={props.variantProps}
          numberSliderPropModifier={props.propModifier}
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
  variantProps: any
  exhibit: ComponentExhibit<true>
  variant: Variant
  onChange: (newProps: any) => void
  onResetButtonClick: () => void
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
      <Button
        className="reset-button"
        icon={{ name: 'arrow-rotate-left' }}
        onClick={() => {
          props.onResetButtonClick()
          onChange(props.variant.props)
        }}
      >
        Reset
      </Button>
      {props.exhibit.propModifiers.map(propModifier => (
        <PropModifierEl
          variantProps={props.variantProps}
          propModifier={propModifier}
          onChange={onChange}
        />
      ))}
    </div>
  )
}

export default render
