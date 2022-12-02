import {
  ComponentExhibit,
  ComponentExhibitBuilder,
  ComponentExhibitOptions,
  NonRootComponentExhibitBuilder,
  ReactComponent,
  ReactComponentWithProps,
  Variant,
  VariantGroup,
} from './types'

/**
 * DO NOT USE THIS IN YOUR COMPONENT LIBRARY CODE.
 */
export const __exhibits: ComponentExhibit[] = []

const nonRootExhibit = (
  defaultProps: any,
  variantGroup: VariantGroup,
) => {
  let _defaultProps: any = defaultProps
  const _nonRootExhibit: NonRootComponentExhibitBuilder<ReactComponentWithProps, boolean, boolean, any> = {
    defaults: __defaultProps => {
      _defaultProps = typeof __defaultProps === 'function' ? (__defaultProps as Function)(_defaultProps) : __defaultProps
      delete (nonRootExhibit as any).defaults
      return _nonRootExhibit
    },
    variant: (_name, props) => {
      const _props = typeof props === 'function' ? (props as Function)(defaultProps) : props
      variantGroup.variants.push({ name: _name, props: _props })
      return _nonRootExhibit
    },
    group: (groupName, fn) => {
      const newNumVariantGroups = variantGroup.variantGroups.push({ name: groupName, variants: [], variantGroups: [] })
      return fn(nonRootExhibit(_defaultProps, variantGroup.variantGroups[newNumVariantGroups - 1])) as any
    },
  }

  return _nonRootExhibit
}

export const exhibit = <
  TReactComponent extends ReactComponent
>(
    renderFn: TReactComponent,
    name: string,
    options?: ComponentExhibitOptions,
  ): ComponentExhibitBuilder<TReactComponent, false, false, undefined> => {
  let eventPropsSelector: any = null
  let defaultProps: any = null
  const variants: Variant[] = []

  const hasProps = renderFn.length > 0

  const variantGroups: VariantGroup[] = []

  const componentExhibitBuilder: ComponentExhibitBuilder<TReactComponent, false, false, undefined> = {
    events: hasProps ? (_eventPropsSelector => {
      eventPropsSelector = _eventPropsSelector
      delete (componentExhibitBuilder as any).events
      return componentExhibitBuilder
    }) : undefined,
    defaults: hasProps ? (_defaultProps => {
      defaultProps = _defaultProps
      delete (componentExhibitBuilder as any).defaults
      return componentExhibitBuilder
    }) : undefined,
    variant: hasProps ? ((_name, props) => {
      const _props = typeof props === 'function' ? (props as Function)(defaultProps) : props
      variants.push({ name: _name, props: _props })
      return componentExhibitBuilder
    }) : undefined,
    group: hasProps ? ((groupName, fn) => {
      const newNumVariantGroups = variantGroups.push({ name: groupName, variants: [], variantGroups: [] })
      // TODO
      fn(nonRootExhibit(defaultProps, variantGroups[newNumVariantGroups - 1]))
      return componentExhibitBuilder
    }) : undefined,
    build: () => {
      const componentExhibit: ComponentExhibit = {
        name,
        groupName: options?.group,
        hasProps,
        renderFn,
        defaultProps,
        eventPropsSelector,
        variants,
        variantGroups,
      }

      __exhibits.push(componentExhibit)

      return componentExhibit as any
    },
  }

  return componentExhibitBuilder
}
