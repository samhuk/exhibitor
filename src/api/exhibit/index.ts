import {
  ComponentExhibit,
  ComponentExhibitBuilder,
  ComponentExhibitOptions,
  ComponentExhibits,
  ExhibitNodes,
  ExhibitNodeType,
  NonRootComponentExhibitBuilder,
  ReactComponent,
  ReactComponentWithProps,
  Variant,
  VariantGroup,
} from './types'

/**
 * DO NOT USE THIS IN YOUR COMPONENT LIBRARY CODE.
 */
export const __exhibits: ComponentExhibits = {}

export const __nodes: ExhibitNodes = {}

export const __exhibitGroups: { [groupName: string]: ComponentExhibits } = {}

export const __ungroupedExhibits: ComponentExhibits = {}

const traverseGroup = (
  variantGroup: VariantGroup,
  path: string[],
  variantGroupFn: (g: VariantGroup, path: string[]) => void,
  variantFn: (v: Variant, path: string[]) => void,
): void => {
  const thisPath = path.length > 0 ? path.concat(variantGroup.name) : [variantGroup.name]
  variantGroupFn(variantGroup, thisPath)
  Object.values(variantGroup.variants).forEach(v => {
    variantFn(v, thisPath.concat(v.name))
  })
  Object.values(variantGroup.variantGroups).forEach(g => traverseGroup(g, thisPath, variantGroupFn, variantFn))
}

const traverse = (
  exhibits: ComponentExhibits,
  exhibitGroupFn: (exhibits: ComponentExhibits, path: string[]) => void,
  variantGroupFn: (vg: VariantGroup, path: string[]) => void,
  variantFn: (v: Variant, path: string[]) => void,
): void => {
  const ungroupedExhibits: ComponentExhibits = {}
  const groupNameToExhibits: { [groupName: string]: ComponentExhibits } = {}
  const groupNames: string[] = Object.values(exhibits).reduce<string[]>((acc, e) => {
    if (e.groupName == null) {
      ungroupedExhibits[e.name] = e
      return acc
    }

    if (groupNameToExhibits[e.groupName] == null)
      groupNameToExhibits[e.groupName] = {}

    groupNameToExhibits[e.groupName][e.name] = e
    return acc.indexOf(e.groupName) === -1 ? acc.concat(e.groupName) : acc
  }, [])

  // Run fn for each exhibit group
  groupNames.forEach(groupName => {
    exhibitGroupFn(groupNameToExhibits[groupName], [encodeURIComponent(groupName)])
  })

  Object.values(exhibits).forEach(e => {
    const basePath = e.groupName != null ? [e.groupName] : []
    if (e.hasProps) {
      traverseGroup(e, basePath, variantGroupFn, variantFn)
      // If show default variant, then we add on another "virtual" variant with the default props of the exhibit
      if (e.showDefaultVariant)
        variantFn({ name: 'Default', props: e.defaultProps }, basePath.concat([e.name, 'Default']))
    }
    // Special case where component has no props, then the exhibit becomes the variant
    else {
      variantFn({ name: e.name, props: undefined }, basePath.concat([e.name]))
    }
  })
}

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
    variant: (variantName, props) => {
      const _props = typeof props === 'function' ? (props as Function)(defaultProps) : props
      variantGroup.variants[variantName] = { name: variantName, props: _props }
      return _nonRootExhibit
    },
    group: (groupName, fn) => {
      variantGroup.variantGroups[groupName] = { name: groupName, variants: {}, variantGroups: {} }
      return fn(nonRootExhibit(_defaultProps, variantGroup.variantGroups[groupName])) as any
    },
  }

  return _nonRootExhibit
}

export const resolve = (
  exhibits: ComponentExhibits,
): ExhibitNodes => {
  const mapPathComponentsToUrlPathString = (p: string[]) => p.map(_p => encodeURIComponent(_p)).join('/')

  const nodes: ExhibitNodes = {}

  traverse(
    exhibits,
    (_exhibits, pathComponents) => {
      const path = mapPathComponentsToUrlPathString(pathComponents)
      nodes[path] = {
        type: ExhibitNodeType.EXHIBIT_GROUP,
        exhibits,
        path,
        pathComponents,
      }
    },
    (variantGroup, pathComponents) => {
      const path = mapPathComponentsToUrlPathString(pathComponents)
      nodes[path] = {
        type: ExhibitNodeType.VARIANT_GROUP,
        variantGroup,
        path,
        pathComponents,
      }
    },
    (variant, pathComponents) => {
      const path = mapPathComponentsToUrlPathString(pathComponents)
      nodes[path] = {
        type: ExhibitNodeType.VARIANT,
        variant,
        path,
        pathComponents,
      }
    },
  )

  return nodes
}

export const exhibit = <
  TReactComponent extends ReactComponent
>(
    renderFn: TReactComponent,
    name: string,
    options?: ComponentExhibitOptions,
  ): ComponentExhibitBuilder<TReactComponent, false, false, undefined> => {
  let eventProps: any = null
  let defaultProps: any = null
  const variants: { [variantName: string]: Variant } = {}

  const hasProps = renderFn.length > 0

  const variantGroups: { [variantGroupName: string]: VariantGroup } = {}

  const componentExhibitBuilder: ComponentExhibitBuilder<TReactComponent, false, false, undefined> = {
    events: hasProps ? (_eventProps => {
      eventProps = _eventProps
      delete (componentExhibitBuilder as any).events
      return componentExhibitBuilder
    }) : undefined,
    defaults: hasProps ? (_defaultProps => {
      defaultProps = _defaultProps
      delete (componentExhibitBuilder as any).defaults
      return componentExhibitBuilder
    }) : undefined,
    variant: hasProps ? ((variantName, props) => {
      const _props = typeof props === 'function' ? (props as Function)(defaultProps) : props
      variants[variantName] = { name: variantName, props: _props }
      return componentExhibitBuilder
    }) : undefined,
    group: hasProps ? ((groupName, fn) => {
      variantGroups[groupName] = { name: groupName, variants: {}, variantGroups: {} }
      fn(nonRootExhibit(defaultProps, variantGroups[groupName]))
      return componentExhibitBuilder
    }) : undefined,
    build: () => {
      const componentExhibit: ComponentExhibit = {
        name,
        groupName: options?.group,
        hasProps,
        renderFn,
        defaultProps,
        eventProps,
        variants,
        variantGroups,
      }

      __exhibits[componentExhibit.name] = componentExhibit

      return componentExhibit as any
    },
  }

  return componentExhibitBuilder
}
