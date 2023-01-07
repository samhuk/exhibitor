import { BoolDependant, IsTrueAndFalse, TypeDependantBaseIntersection } from '@samhuk/type-helpers/dist/type-helpers/types'

export type ReactComponentWithProps<TProps extends any = any> = (props: TProps) => JSX.Element

export type ReactComponentWithoutProps = () => JSX.Element

export type ReactComponent<TProps extends any = any> = ReactComponentWithProps<TProps> | ReactComponentWithoutProps

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

export type EventsOptions<
  TProps extends any = any,
> = Partial<{
  [K in keyof TProps as TProps[K] extends Function ? K : never]: TProps[K] extends Function ? boolean : (TProps[K] & EventsOptions<TProps[K]>)
}>

type _ComponentExhibitBuilder<
  TProps extends any = any,
  THasProps extends boolean = boolean,
  THasDefinedEvents extends boolean = boolean,
  THasDefinedDefaultProps extends boolean = boolean,
  THasDefinedOptions extends boolean = boolean,
  THasDefinedTests extends boolean = boolean,
  TDefaultProps extends TProps = TProps,
  TIsGroup extends boolean = false,
> =
  IncludeIfFalse<TIsGroup, IncludeIfFalse<THasDefinedTests, {
    tests: (
      testFilePath: string
    ) => _ComponentExhibitBuilder<TProps, THasProps, THasDefinedEvents, THasDefinedDefaultProps, THasDefinedOptions, true, TDefaultProps, TIsGroup>
  }>>
  & IncludeIfFalse<TIsGroup, IncludeIfFalse<THasDefinedOptions, {
    options: (
      options: {
        group?: string
      }
      & IncludeIfTrue<THasProps, IncludeIfTrue<THasDefinedDefaultProps, {
        showDefaultVariant?: boolean
      }>>
    ) => _ComponentExhibitBuilder<TProps, THasProps, THasDefinedEvents, THasDefinedDefaultProps, true, THasDefinedTests, TDefaultProps, TIsGroup>
  }>>
  & IncludeIfFalse<TIsGroup, IncludeIfTrue<THasProps, IncludeIfFalse<THasDefinedEvents, {
    events: (
      eventProps: EventsOptions<TProps>
    ) => _ComponentExhibitBuilder<TProps, THasProps, true, THasDefinedDefaultProps, THasDefinedOptions, THasDefinedTests, TDefaultProps, TIsGroup>
  }>>>
  & IncludeIfTrue<THasProps, IncludeIfFalse<THasDefinedDefaultProps, {
    defaults: <TNewDefaultProps extends TProps>(
      defaultProps: THasDefinedDefaultProps extends true ? (TNewDefaultProps | ((defaults: TDefaultProps) => TNewDefaultProps)) : TNewDefaultProps,
    ) => _ComponentExhibitBuilder<TProps, THasProps, THasDefinedEvents, true, THasDefinedOptions, THasDefinedTests, TNewDefaultProps, TIsGroup>
  }>>
  & IncludeIfTrue<THasProps, {
    variant: (
      /**
       * The name of the variant.
       */
      name: string,
      /**
       * The component props to use for the variant.
       *
       * If default props have been defined then this can optionally be a function
       * that takes the default props and returns the props of the variant.
       */
      props: THasDefinedDefaultProps extends true ? (TProps | ((defaults: TDefaultProps) => TProps)) : TProps,
    ) => _ComponentExhibitBuilder<TProps, THasProps, THasDefinedEvents, THasDefinedDefaultProps, THasDefinedOptions, THasDefinedTests, TDefaultProps, TIsGroup>
  }>
  & IncludeIfTrue<THasProps, {
    // eslint-disable-next-line max-len
    group: (name: string, fn: (ex: _ComponentExhibitBuilder<TProps, THasProps, THasDefinedEvents, false, THasDefinedOptions, THasDefinedTests, TDefaultProps, true>) => void) => _ComponentExhibitBuilder<TProps, THasProps, THasDefinedEvents, THasDefinedDefaultProps, THasDefinedOptions, THasDefinedTests, TDefaultProps, TIsGroup>
  }>
  & IncludeIfFalse<TIsGroup, {
    build: () => ComponentExhibit<THasProps, TProps, TDefaultProps>
  }>

export type ComponentExhibitOptions = {
  group?: string
}

export type NonRootComponentExhibitBuilder<
  TReactComponent extends ReactComponent = ReactComponent,
  THasDefinedEvents extends boolean = boolean,
  THasDefinedDefaultProps extends boolean = boolean,
  THasDefinedOptions extends boolean = boolean,
  TDefaultProps extends undefined = undefined,
> = _ComponentExhibitBuilder<
  PropsOfReactComponent<TReactComponent>,
  DoesReactComponentHavePropsArg<TReactComponent>,
  THasDefinedEvents,
  THasDefinedDefaultProps,
  THasDefinedOptions,
  false,
  TDefaultProps,
  true
>

export type ComponentExhibitBuilder<
  TReactComponent extends ReactComponent = ReactComponent,
  THasDefinedEvents extends boolean = boolean,
  THasDefinedDefaultProps extends boolean = boolean,
  THasDefinedOptions extends boolean = boolean,
  THasDefinedTests extends boolean = boolean,
  TDefaultProps extends undefined = undefined,
> = _ComponentExhibitBuilder<
  PropsOfReactComponent<TReactComponent>,
  DoesReactComponentHavePropsArg<TReactComponent>,
  THasDefinedEvents,
  THasDefinedDefaultProps,
  THasDefinedOptions,
  THasDefinedTests,
  TDefaultProps
>

export type Variant<TProps extends any = any> = {
  name: string
  props: TProps
}

export type VariantGroup<TProps extends any = any> = {
  name: string
  variants: { [variantName: string]: Variant<TProps> }
  variantGroups: { [variantGroupName: string]: VariantGroup<TProps> }
}

export type ComponentExhibit<
  THasProps extends boolean = boolean,
  TProps extends any = any,
  TDefaultProps extends TProps = TProps,
> = {
  name: string
  groupName?: string
  renderFn: ReactComponent<TProps>
} & BoolDependant<
  {
    true: {
      defaultProps?: TDefaultProps
      /**
       * @default true
       */
      showDefaultVariant?: boolean
      eventProps?: EventsOptions<TProps> | null
    } & VariantGroup<TProps>
    false: { }
  },
  THasProps,
  'hasProps'
>

export type ComponentExhibits = { [name: string]: ComponentExhibit }

export enum ExhibitNodeType {
  EXHIBIT_GROUP,
  VARIANT_GROUP,
  VARIANT
}

export type ExhibitNode<
  TType extends ExhibitNodeType = ExhibitNodeType
> = TypeDependantBaseIntersection<
  ExhibitNodeType,
  {
    [ExhibitNodeType.EXHIBIT_GROUP]: {
      groupName: string
    }
    [ExhibitNodeType.VARIANT_GROUP]: {
      variantGroup: VariantGroup
    }
    [ExhibitNodeType.VARIANT]: {
      exhibit: ComponentExhibit
      variant: Variant
    }
  },
  TType
> & {
  /**
   * URL-encoded joined path string
   */
  path: string
  /**
   * Unencoded path string components
   */
  pathComponents: string[]
}

export type VariantExhibitNode = ExhibitNode<ExhibitNodeType.VARIANT>

export type PathTree = {
  [path: string]: PathTree | boolean
}

export type ExhibitNodes = { [path: string]: ExhibitNode }
