import { BoolDependant, IsTrueAndFalse } from '@samhuk/type-helpers/dist/type-helpers/types'

export type ReactComponent<TProps extends any = any> = ((props: TProps) => JSX.Element) | (() => JSX.Element)

export type PropsOfReactComponent<
  TReactComponent extends ReactComponent = ReactComponent,
> = Parameters<TReactComponent>[0]

export type DoesReactComponentHavePropsArg<
  TReactComponent extends ReactComponent = ReactComponent,
> = Parameters<TReactComponent> extends { 0: any } ? true : false

type IncludeIfTrue<TBool extends boolean, ObjToInclude, ExplicitElseObj extends any = {}> = IsTrueAndFalse<TBool> extends true
  ? ObjToInclude
  : (TBool extends true ? ObjToInclude : ExplicitElseObj)

type IncludeIfFalse<TBool extends boolean, ObjToInclude, ExplicitElseObj extends any = {}> = IsTrueAndFalse<TBool> extends true
  ? ObjToInclude
  : (TBool extends false ? ObjToInclude : ExplicitElseObj)

type EventsDict = { [eventName: string]: (...eventProps: any) => any }

export type EventsSelector<
  TProps extends any = any,
> = (props: TProps) => EventsDict

type _ComponentExhibitBuilder<
  TProps extends any = any,
  THasProps extends boolean = boolean,
  THasDefinedEvents extends boolean = boolean,
  THasDefinedDefaultProps extends boolean = boolean,
  TDefaultProps extends TProps = TProps,
> =
  IncludeIfTrue<THasProps, IncludeIfFalse<THasDefinedEvents, {
    events: (
      selector: EventsSelector<TProps>
    ) => _ComponentExhibitBuilder<TProps, THasProps, true, THasDefinedDefaultProps, TDefaultProps>
  }>>
  & IncludeIfTrue<THasProps, IncludeIfFalse<THasDefinedDefaultProps, {
    defaults: <TNewDefaultProps extends TProps>(
      defaultProps: TNewDefaultProps
    ) => _ComponentExhibitBuilder<TProps, THasProps, THasDefinedEvents, true, TNewDefaultProps>
  }>>
  & IncludeIfTrue<THasProps, {
    variant: (
      name: string,
      props: THasDefinedDefaultProps extends true ? (TProps | ((defaults: TDefaultProps) => TProps)) : TProps
    ) => _ComponentExhibitBuilder<TProps, THasProps, THasDefinedEvents, THasDefinedDefaultProps, TDefaultProps>
  }> & {
  build: () => ComponentExhibit<THasProps, TProps, TDefaultProps>
}

export type ComponentExhibitBuilder<
  TReactComponent extends ReactComponent = ReactComponent,
  THasDefinedEvents extends boolean = boolean,
  THasDefinedDefaultProps extends boolean = boolean,
  TDefaultProps extends undefined = undefined,
> = _ComponentExhibitBuilder<
  PropsOfReactComponent<TReactComponent>,
  DoesReactComponentHavePropsArg<TReactComponent>,
  THasDefinedEvents,
  THasDefinedDefaultProps,
  TDefaultProps
>

export type ComponentExhibit<
  THasProps extends boolean = boolean,
  TProps extends any = any,
  TDefaultProps extends TProps = TProps,
> = {
  name: string
  renderFn: ReactComponent<TProps>
} & BoolDependant<
  {
    true: {
      defaultProps?: TDefaultProps
      variants: { name: string, props: TProps }[]
      eventPropsSelector: EventsSelector<TProps>
    }
    false: { }
  },
  THasProps,
  'hasProps'
>
