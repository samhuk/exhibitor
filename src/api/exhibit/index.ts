import { ComponentExhibit, ComponentExhibitBuilder, ReactComponent } from './types'

/**
 * DO NOT USE THIS IN YOUR COMPONENT LIBRARY CODE.
 */
export const __exhibits: ComponentExhibit[] = []

export const exhibit = <
  TReactComponent extends ReactComponent
>(
    renderFn: TReactComponent,
    name: string,
  ): ComponentExhibitBuilder<TReactComponent, false, false, undefined> => {
  let eventPropsSelector: any = null
  let defaultProps: any = null
  const variants: any[] = []

  const hasProps = renderFn.length > 0

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
    build: () => {
      const componentExhibit: ComponentExhibit = {
        name,
        hasProps,
        renderFn,
        defaultProps,
        eventPropsSelector,
        variants,
      }

      __exhibits.push(componentExhibit)

      return componentExhibit as any
    },
  }

  return componentExhibitBuilder
}
