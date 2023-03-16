import { TypeDependantBaseIntersection } from '@samhuk/type-helpers'

export type ExtractPropNamesOfType<TProps extends any = any, TPropType extends any = any> =
  keyof { [TPropName in keyof TProps as TProps[TPropName] extends TPropType ? TPropName : never]: true }

export type NumberPropModifierBase = {
  /**
   * The minimum value of the number-type prop modifier.
   */
  min?: number
  /**
   * The maximum value of the number-type prop modifier.
   */
  max?: number
  /**
   * The increment size of the number-type prop modifier.
   *
   * @default 1
   */
  step?: number
}

export type SelectPropModifierOption = string | number | [value: string | number, displayText?: string]

export enum PropModifierType {
  /**
   * A checkbox-type prop modifier. This should be for boolean-type props.
   */
  CHECKBOX = 'CHECKBOX',
  /**
   * A number-input-type prop modifier. This should be for number-type props.
   */
  NUMBER_INPUT = 'NUMBER_INPUT',
  /**
   * A number-slider-type prop modifier. This should be for number-type props.
   */
  NUMBER_SLIDER = 'NUMBER_SLIDER',
  /**
   * A text-input-type prop modifier. This should be for string-type props.
   */
  TEXT_INPUT = 'TEXT_INPUT',
  /**
   * A select-type prop modifier. This should be for string-type or number-type props
   * that represent an enumeration.
   */
  SELECT = 'SELECT'
}

export type PropModifierBase<TProps extends any = any, TProp extends any = any> = {
  /**
   * The name of the prop modifier.
   */
  label: string
  /**
   * Describes how the value of this prop modifier is taken from the current props
   * of the component.
   */
  init: (currentProps: TProps) => TProp
  /**
   * Describes how the value of this prop modifier is applied to create new props
   * for the component.
   */
  apply: (newValue: TProp, currentProps: TProps) => TProps
}

export type PropModifier<
  TProps extends any = any,
  TPropModifierType extends PropModifierType = PropModifierType,
> = TypeDependantBaseIntersection<PropModifierType, {
  [PropModifierType.CHECKBOX]: PropModifierBase<TProps, boolean>,
  [PropModifierType.NUMBER_INPUT]: NumberPropModifierBase & PropModifierBase<TProps, number>,
  [PropModifierType.NUMBER_SLIDER]: NumberPropModifierBase & PropModifierBase<TProps, number>,
  [PropModifierType.TEXT_INPUT]: PropModifierBase<TProps, string>,
  [PropModifierType.SELECT]: PropModifierBase<TProps, string | number> & {
    options: SelectPropModifierOption[]
  },
}, TPropModifierType>
