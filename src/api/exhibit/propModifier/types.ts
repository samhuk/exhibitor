import { TypeDependantBaseIntersection } from '@samhuk/type-helpers'

export type SelectPropModifierOption = string | [value: string, displayText?: string]

export enum PropModifierType {
  BOOLEAN_CHECKBOX = 'BOOLEAN_CHECKBOX',
  NUMBER_INPUT = 'NUMBER_INPUT',
  NUMBER_SLIDER = 'NUMBER_SLIDER',
  STRING_INPUT = 'STRING_INPUT',
  SELECT = 'SELECT'
}

export type PropModifier<
  TProps extends any = any,
  TPropModifierType extends PropModifierType = PropModifierType,
> = TypeDependantBaseIntersection<PropModifierType, {
  [PropModifierType.BOOLEAN_CHECKBOX]: {
    init: (currentProps: TProps) => boolean
    apply: (newValue: boolean, currentProps: TProps) => TProps
  },
  [PropModifierType.NUMBER_INPUT]: {
    init: (currentProps: TProps) => number
    apply: (newValue: number, currentProps: TProps) => TProps
  },
  [PropModifierType.NUMBER_SLIDER]: {
    init: (currentProps: TProps) => number
    apply: (newValue: number, currentProps: TProps) => TProps
  },
  [PropModifierType.STRING_INPUT]: {
    init: (currentProps: TProps) => string
    apply: (newValue: string, currentProps: TProps) => TProps
  },
  [PropModifierType.SELECT]: {
    options: SelectPropModifierOption[]
    init: (currentProps: TProps) => string | number
    apply: (newValue: string | number, currentProps: TProps) => TProps
  },
}, TPropModifierType> & { label: string }
