import { TypeDependantBaseIntersection } from '@samhuk/type-helpers'

export type SelectPropModifierOption = string | [value: string, displayText?: string]

export enum PropModifierType {
  CHECKBOX = 'CHECKBOX',
  // NUMBER_INPUT = 'NUMBER_INPUT',
  NUMBER_SLIDER = 'NUMBER_SLIDER',
  TEXT_INPUT = 'TEXT_INPUT',
  SELECT = 'SELECT'
}

export type PropModifier<
  TProps extends any = any,
  TPropModifierType extends PropModifierType = PropModifierType,
> = TypeDependantBaseIntersection<PropModifierType, {
  [PropModifierType.CHECKBOX]: {
    init: (currentProps: TProps) => boolean
    apply: (newValue: boolean, currentProps: TProps) => TProps
  },
  // [PropModifierType.NUMBER_INPUT]: {
  //   init: (currentProps: TProps) => number
  //   apply: (newValue: number, currentProps: TProps) => TProps
  // },
  [PropModifierType.NUMBER_SLIDER]: {
    min: number
    max: number
    /**
     * @default 1
     */
    step?: number
    init: (currentProps: TProps) => number
    apply: (newValue: number, currentProps: TProps) => TProps
  },
  [PropModifierType.TEXT_INPUT]: {
    init: (currentProps: TProps) => string
    apply: (newValue: string, currentProps: TProps) => TProps
  },
  [PropModifierType.SELECT]: {
    options: SelectPropModifierOption[]
    init: (currentProps: TProps) => string | number
    apply: (newValue: string | number, currentProps: TProps) => TProps
  },
}, TPropModifierType> & { label: string }
