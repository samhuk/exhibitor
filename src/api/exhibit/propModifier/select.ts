import { ExtractPropNamesOfType, PropModifier, PropModifierBase, PropModifierType, SelectPropModifierOption } from './types'

export const textInputModifier = <TProps extends any>(
  options: PropModifierBase<TProps, string | number> & { options: SelectPropModifierOption[] },
): PropModifier<TProps, PropModifierType.SELECT> => ({
    ...options,
    type: PropModifierType.SELECT,
  })

/**
 * Creates a Select-type Prop Modifier with default value bindings.

 * @example
 * exhibit(AlertComponent, 'Alert')
 *   .propModifiers([
 *     simpleSelectModifier('severity', ['info', 'warn', 'error'])
 *   ])
 *
 * @alias
 * ```typescript
 * exhibit(AlertComponent, 'Alert')
 *   .propModifiers([
 *     {
 *       type: PropModifierType.SELECT,
 *       label: 'severity',
 *       options: ['info', 'warn', 'error'],
 *       apply: (newValue, currentProps) => ({ ...currentProps, severity: newValue }),
 *       init: currentProps => currentProps.severity,
 *     }
 *   ])
 * ```
 */
export const simpleSelectModifier = <TProps extends any>(
  propName: ExtractPropNamesOfType<TProps, string | number>,
  options: SelectPropModifierOption[],
): PropModifier<TProps, PropModifierType.SELECT> => ({
    type: PropModifierType.SELECT,
    label: propName as string,
    options,
    apply: (newValue, currentProps) => ({ ...(currentProps as any), [propName as string]: newValue }),
    init: currentProps => (currentProps as any)[propName as string],
  })
