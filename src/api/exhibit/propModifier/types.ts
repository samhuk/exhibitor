import { TypeDependantBaseIntersection } from '@samhuk/type-helpers'

type NumberPropModifierBase = {
  min?: number
  max?: number
  /**
   * @default 1
   */
  step?: number
}

export type SelectPropModifierOption = string | [value: string, displayText?: string]

export enum PropModifierType {
  CHECKBOX = 'CHECKBOX',
  NUMBER_INPUT = 'NUMBER_INPUT',
  NUMBER_SLIDER = 'NUMBER_SLIDER',
  TEXT_INPUT = 'TEXT_INPUT',
  SELECT = 'SELECT'
}

type PropModifierBase<TProps extends any = any, TProp extends any = any> = {
  init: (currentProps: TProps) => TProp
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
}, TPropModifierType> & { label: string }
