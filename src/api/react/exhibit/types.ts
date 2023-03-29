import { ReactElement } from 'react'

export type ReactComponentWithProps<TProps extends any = any> = (props: TProps) => ReactElement

export type ReactComponentWithoutProps = () => ReactElement

export type ReactComponent<TProps extends any = any> = ReactComponentWithProps<TProps> | ReactComponentWithoutProps

export type PropsOfReactComponent<
  TReactComponent extends ReactComponent = ReactComponent,
> = Parameters<TReactComponent>[0]

export type DoesReactComponentHavePropsArg<
  TReactComponent extends ReactComponent = ReactComponent,
> = Parameters<TReactComponent> extends { 0: any } ? true : false
