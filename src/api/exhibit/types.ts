/* eslint-disable max-len */
import { BoolDependant, IsTrueAndFalse, TypeDependantBaseIntersection } from '@samhuk/type-helpers/dist/type-helpers/types'
import { PropModifier } from './propModifier/types'

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

export type ComponentExhibitBuilder<
  TComponent extends any = any,
  TProps extends any = any,
  THasProps extends boolean = boolean,
  TDefaultProps extends TProps = TProps,
  THasDefinedEvents extends boolean = boolean,
  THasDefinedDefaultProps extends boolean = boolean,
  THasDefinedOptions extends boolean = boolean,
  THasDefinedTests extends boolean = boolean,
  THasDefinedPropModifiers extends boolean = boolean,
  TIsGroup extends boolean = false,
> =
  IncludeIfFalse<TIsGroup, IncludeIfFalse<THasDefinedTests, {
    tests: (
      testFilePath: string
    ) => ComponentExhibitBuilder<TComponent, TProps, THasProps, TDefaultProps, THasDefinedEvents, THasDefinedDefaultProps, THasDefinedOptions, true, THasDefinedPropModifiers, TIsGroup>
  }>>
  & IncludeIfFalse<TIsGroup, IncludeIfFalse<THasDefinedOptions, {
    /**
     * Miscellaneous options for the exhibit.
     *
     * @example
     * exhibit(Button, 'Button')
     *   .options({ group: 'Final Review' })
     */
    options: (
      options: {
        /**
         * Optional name of the group the exhibit belongs to.
         *
         * If not defined, this will be appear as an ungrouped exhibit.
         */
        group?: string
      }
      & IncludeIfTrue<THasProps, IncludeIfTrue<THasDefinedDefaultProps, {
        showDefaultVariant?: boolean
      }>>
    ) => ComponentExhibitBuilder<TComponent, TProps, THasProps, TDefaultProps, THasDefinedEvents, THasDefinedDefaultProps, true, THasDefinedTests, THasDefinedPropModifiers, TIsGroup>
  }>>
  & IncludeIfFalse<TIsGroup, IncludeIfTrue<THasProps, IncludeIfFalse<THasDefinedEvents, {
    /**
     * Specify what props of the component correspond to event handlers. For example,
     * this will most likely be functions like "onClick", "onKeyPress", "onValueChange", etc.
     *
     * When these events occur while the component is being interacted with, the calls to
     * these event handler functions will be logged in the Event Log bottom-bar page in the
     * Exhibitor site.
     *
     * @example
     * exhibit(Button, 'Button')
     *   .events({
     *     onClick: true,
     *     onValueChange: true,
     *   })
     */
    events: (
      eventProps: EventsOptions<TProps>
    ) => ComponentExhibitBuilder<TComponent, TProps, THasProps, TDefaultProps, true, THasDefinedDefaultProps, THasDefinedOptions, THasDefinedTests, THasDefinedPropModifiers, TIsGroup>
  }>>>
  & IncludeIfFalse<TIsGroup, IncludeIfTrue<THasProps, {
    /**
     * Specify what prop modifiers exist for all Variants of this Component Exhibit.
     *
     * @example
     * import { PropModifierType} from 'exhibitor'
     *
     * exhibit(Button, 'Button')
     *   .defaults({ ... })
     *   .propModifiers([
     *     {
     *       label: 'Color',
     *       type: PropModifierType.SELECT,
     *       options: ['blue', 'green', 'red', 'yellow'],
     *       // Tells Exhibitor how this prop is retrieved from props
     *       init: props => props.variant,
     *       // Tells Exhibitor how this prop's value is set to props
     *       apply: (newColor, currentProps) => ({ ...currentProps, color: newColor }),
     *     },
     *   ])
     *
     * @example
     * import { simpleSelectModifier } from 'exhibitor'
     *
     * exhibit(Button, 'Button')
     *   .defaults({ ... })
     *   .propModifiers([
     *     simpleSelectModifier('color', ['blue', 'green', 'red', 'yellow']),
     *   ])
     */
    propModifiers: (
      propModifiers: PropModifier<TProps>[]
    ) => ComponentExhibitBuilder<TComponent, TProps, THasProps, TDefaultProps, THasDefinedEvents, THasDefinedDefaultProps, THasDefinedOptions, THasDefinedTests, THasDefinedPropModifiers, TIsGroup>
  }>>
  & IncludeIfTrue<THasProps, IncludeIfFalse<THasDefinedDefaultProps, {
    /**
     * Specify the default props for any variants in this exhibit group.
     *
     * @example
     * exhibit(Button, 'Button')
     *   .defaults({
     *     onClick: () => undefined,
     *     color: 'default',
     *     iconPosition: 'left',
     *     text: 'Button Text',
     *     size: 'normal',
     *     disabled: false,
     *   })
     */
    defaults: <TNewDefaultProps extends TProps>(
      defaultProps: THasDefinedDefaultProps extends true ? (TNewDefaultProps | ((defaults: TDefaultProps) => TNewDefaultProps)) : TNewDefaultProps,
    ) => ComponentExhibitBuilder<TComponent, TProps, THasProps, TNewDefaultProps, THasDefinedEvents, true, THasDefinedOptions, THasDefinedTests, THasDefinedPropModifiers, TIsGroup>
  }>>
  & IncludeIfTrue<THasProps, {
    /**
     * Specify a variant of the component. This enables you to show the component
     * with different props.
     *
     * @example
     * exhibit(Button, 'Button')
     *   .defaults({ color: 'blue' })
     *   .variant('green', defaultProps => ({
     *     ...defaultProps,
     *     color: ButtonColor.GREEN,
     *   }))
     */
    variant: (
      /**
       * The name of the variant.
       */
      name: string,
      /**
       * The props to use for the variant.
       *
       * If default props have been defined then this can optionally be a function
       * that takes the default props and returns the props of the variant.
       */
      props: THasDefinedDefaultProps extends true ? (TProps | ((defaults: TDefaultProps) => TProps)) : TProps,
    ) => ComponentExhibitBuilder<TComponent, TProps, THasProps, TDefaultProps, THasDefinedEvents, THasDefinedDefaultProps, THasDefinedOptions, THasDefinedTests, THasDefinedPropModifiers, TIsGroup>
  }>
  & IncludeIfTrue<THasProps, {
    /**
     * Specify a group of variants. This is useful for grouping variant together
     * with related props. For example, if your component has a "darkMode" prop,
     * a "dark" and "light" variant group can be defined.
     *
     * @example
     * exhibit(Button, 'Button')
     *   .group('large', ex => ex
     *     .variant('w/o icon', defaultProps => {
     *       ...defaultProps,
     *       size: 'large',
     *     })
     *     .variant('w/o icon', defaultProps => {
     *       ...defaultProps,
     *       size: 'large',
     *       iconName: 'paper-plane',
     *     }))
     */
    group: (
      name: string,
      fn: (
        ex: ComponentExhibitBuilder<TComponent, TProps, THasProps, TDefaultProps, THasDefinedEvents, false, THasDefinedOptions, THasDefinedTests, THasDefinedPropModifiers, true>
      ) => void
    ) => ComponentExhibitBuilder<TComponent, TProps, THasProps, TDefaultProps, THasDefinedEvents, THasDefinedDefaultProps, THasDefinedOptions, THasDefinedTests, THasDefinedPropModifiers, TIsGroup>
  }>
  & IncludeIfFalse<TIsGroup, {
    /**
     * Builds the component exhibit, stating that the exhibit building is completed.
     *
     * This should be the last call to `exhibit(...)`.
     *
     * @example
     * exhibit(Button, 'Button')
     *   ...
     *   .build()
     */
    build: () => ComponentExhibit<TComponent, TProps, THasProps, TDefaultProps>
  }>

export type ComponentExhibitOptions = {
  group?: string
}

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
  TComponent extends any = any,
  TProps extends any = any,
  THasProps extends boolean = boolean,
  TDefaultProps extends TProps = TProps,
> = {
  name: string
  srcPath: string
  /**
   * Path to test source file, relative to `srcPath`.
   */
  testSrcPath: string
  groupName?: string
  component: TComponent
} & BoolDependant<
  {
    true: {
      defaultProps?: TDefaultProps
      /**
       * @default true
       */
      showDefaultVariant?: boolean
      eventProps?: EventsOptions<TProps> | null
      /**
       * @default []
       */
      propModifiers?: PropModifier<TProps>[]
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
