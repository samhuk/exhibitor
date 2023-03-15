import { ExtractPropNamesOfType, NumberPropModifierBase, PropModifier, PropModifierBase, PropModifierType } from './types'

export const numberInputModifier = <TProps extends any>(
  options: NumberPropModifierBase & PropModifierBase<TProps, number>,
): PropModifier<TProps, PropModifierType.NUMBER_INPUT> => ({
    ...options,
    type: PropModifierType.NUMBER_INPUT,
  })

/**
 * Creates a Number Input-type Prop Modifier with default value bindings.

 * @example
 * exhibit(CounterComponent, 'Counter')
 *   .propModifiers([
 *     simpleNumberInputModifier('count', { min: 0, max: 10, step: 1 })
 *   ])
 *
 * @alias
 * ```typescript
 * exhibit(CounterComponent, 'Counter')
 *   .propModifiers([
 *     {
 *       type: PropModifierType.NUMBER_INPUT,
 *       label: 'count',
 *       apply: (newValue, currentProps) => ({ ...currentProps, count: newValue }),
 *       init: currentProps => currentProps.count,
 *     }
 *   ])
 * ```
 */
export const simpleNumberInputModifier = <TProps extends any>(
  propName: ExtractPropNamesOfType<TProps, number>,
  options?: NumberPropModifierBase,
): PropModifier<TProps, PropModifierType.NUMBER_INPUT> => ({
    type: PropModifierType.NUMBER_INPUT,
    label: propName as string,
    apply: (newValue, currentProps) => ({ ...(currentProps as any), [propName]: newValue }),
    init: currentProps => (currentProps as any)[propName],
    ...options,
  })
