import { ExtractPropNamesOfType, PropModifier, PropModifierBase, PropModifierType } from './types'

export const textInputModifier = <TProps extends any>(
  options: PropModifierBase<TProps, string>,
): PropModifier<TProps, PropModifierType.TEXT_INPUT> => ({
    ...options,
    type: PropModifierType.TEXT_INPUT,
  })

/**
 * Creates a Text Input-type Prop Modifier with default value bindings.

 * @example
 * exhibit(GreetingComponent, 'Greeting')
 *   .propModifiers([
 *     simpleTextInputModifier('username')
 *   ])
 *
 * @alias
 * ```typescript
 * exhibit(GreetingComponent, 'Greeting')
 *   .propModifiers([
 *     {
 *       type: PropModifierType.TEXT_INPUT,
 *       label: 'username',
 *       apply: (newValue, currentProps) => ({ ...currentProps, username: newValue }),
 *       init: currentProps => currentProps.username,
 *     }
 *   ])
 * ```
 */
export const simpleTextInputModifier = <TProps extends any>(
  propName: ExtractPropNamesOfType<TProps, string>,
): PropModifier<TProps, PropModifierType.TEXT_INPUT> => ({
    type: PropModifierType.TEXT_INPUT,
    label: propName as string,
    apply: (newValue, currentProps) => ({ ...(currentProps as any), [propName as string]: newValue }),
    init: currentProps => (currentProps as any)[propName as string],
  })
