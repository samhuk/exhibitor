import { exhibit as exhibitBase } from '../../exhibit/index'
import { DoesReactComponentHavePropsArg, PropsOfReactComponent, ReactComponent } from './types'

const componentHasPropsDetiminator = (component: ReactComponent) => {
  if (typeof component === 'function')
    return component.length > 0

  /* For now, the only case where this is encountered is when using React's forwardRef(). This
   * doesn't create a function React component, but instead an object with a render function property
   * that accepts props and a ref.
   */
  return (component as { render: Function }).render.length > 0
}

export const exhibit = <TReactComponent extends ReactComponent>(
  component: TReactComponent,
  name: any,
) => exhibitBase<
  TReactComponent,
  PropsOfReactComponent<TReactComponent>,
  DoesReactComponentHavePropsArg<TReactComponent>
>(component, name, componentHasPropsDetiminator)
