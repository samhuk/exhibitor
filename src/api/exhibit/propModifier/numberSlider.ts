import { ExtractPropNamesOfType, NumberPropModifierBase, PropModifier, PropModifierBase, PropModifierType } from './types'

export const numberSliderModifier = <TProps extends any>(
  options: NumberPropModifierBase & PropModifierBase<TProps, number>,
): PropModifier<TProps, PropModifierType.NUMBER_SLIDER> => ({
    ...options,
    type: PropModifierType.NUMBER_SLIDER,
  })

/**
 * Creates a Number Slider-type Prop Modifier with default value bindings.

 * @example
 * exhibit(CounterComponent, 'Counter')
 *   .propModifiers([
 *     simpleNumberSliderModifier('count', { min: 0, max: 10, step: 1 })
 *   ])
 *
 * @alias
 * ```typescript
 * exhibit(CounterComponent, 'Counter')
 *   .propModifiers([
 *     {
 *       type: PropModifierType.NUMBER_SLIDER,
 *       label: 'count',
 *       apply: (newValue, currentProps) => ({ ...currentProps, count: newValue }),
 *       init: currentProps => currentProps.count,
 *     }
 *   ])
 * ```
 */
export const simpleNumberSliderModifier = <TProps extends any>(
  propName: ExtractPropNamesOfType<TProps, number>,
  options?: NumberPropModifierBase,
): PropModifier<TProps, PropModifierType.NUMBER_SLIDER> => ({
    type: PropModifierType.NUMBER_SLIDER,
    label: propName as string,
    apply: (newValue, currentProps) => ({ ...(currentProps as any), [propName]: newValue }),
    init: currentProps => (currentProps as any)[propName],
    ...options,
  })
