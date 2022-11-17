import { ComponentExhibit, ComponentExhibitBuilder, ReactComponent } from './types'

const exhibits: ComponentExhibit[] = []

export const exhibit = <
  TReactComponent extends ReactComponent
>(
    name: string,
    renderFn: TReactComponent,
  ): ComponentExhibitBuilder<TReactComponent, false, false, undefined> => {
  let eventPropsSelector: any = null
  let defaultProps: any = null
  const variants: any[] = []

  const componentExhibitBuilder: ComponentExhibitBuilder<TReactComponent, false, false, undefined> = {
    events: _eventPropsSelector => {
      eventPropsSelector = _eventPropsSelector
      delete componentExhibitBuilder.events
      return componentExhibitBuilder
    },
    defaults: _defaultProps => {
      defaultProps = _defaultProps
      delete componentExhibitBuilder.defaults
      return componentExhibitBuilder
    },
    variant: (_name, props) => {
      const _props = typeof props === 'function' ? (props as Function)(defaultProps) : props
      variants.push({ name: _name, props: _props })
      return componentExhibitBuilder
    },
    build: () => {
      const componentExhibit: ComponentExhibit = {
        name,
        renderFn,
        defaultProps,
        eventPropsSelector,
        variants,
      }

      exhibits.push(componentExhibit)

      return componentExhibit as any
    },
  }

  return componentExhibitBuilder
}

export default exhibits
