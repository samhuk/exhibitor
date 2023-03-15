import { ExtractPropNamesOfType, PropModifier, PropModifierBase, PropModifierType } from './types'

export const checkboxModifier = <TProps extends any>(
  options: PropModifierBase<TProps, boolean>,
): PropModifier<TProps, PropModifierType.CHECKBOX> => ({
    ...options,
    type: PropModifierType.CHECKBOX,
  })

/**
 * Creates a Checkbox-type Prop Modifier with default value bindings.

 * @example
 * exhibit(ButtonComponent, 'Button')
 *   .propModifiers([
 *     simpleCheckboxModifier('large')
 *   ])
 *
 * @alias
 * ```typescript
 * exhibit(ButtonComponent, 'Button')
 *   .propModifiers([
 *     {
 *       type: PropModifierType.CHECKBOX,
 *       label: 'large',
 *       apply: (newValue, currentProps) => ({ ...currentProps, large: newValue }),
 *       init: currentProps => currentProps.large,
 *     }
 *   ])
 * ```
 */
export const simpleCheckboxModifier = <TProps extends any>(
  propName: ExtractPropNamesOfType<TProps, boolean>,
): PropModifier<TProps, PropModifierType.CHECKBOX> => ({
    type: PropModifierType.CHECKBOX,
    label: propName as string,
    apply: (newValue, currentProps) => ({ ...(currentProps as any), [propName as string]: newValue }),
    init: currentProps => (currentProps as any)[propName as string],
  })
