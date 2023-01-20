import {
  ComponentExhibit,
  ComponentExhibitBuilder,
  ComponentExhibits,
  ExhibitNodes,
  ExhibitNodeType,
  NonRootComponentExhibitBuilder,
  PathTree,
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
  exhibit: ComponentExhibit,
  variantGroup: VariantGroup,
  pathComponents: string[],
  variantGroupFn: (g: VariantGroup, path: string[]) => void,
  variantFn: (v: Variant, path: string[], exhibit: ComponentExhibit) => void,
): PathTree => {
  const thisPathComponents = pathComponents.length > 0 ? pathComponents.concat(variantGroup.name) : [variantGroup.name]
  const thisPath = thisPathComponents.map(p => encodeURIComponent(p)).join('/')
  const pathTree: PathTree = { [thisPath]: {} }
  const thisPathTreeNode = pathTree[thisPath] as PathTree
  variantGroupFn(variantGroup, thisPathComponents)
  Object.values(variantGroup.variants).forEach(v => {
    const variantPath = thisPathComponents.concat(v.name).map(p => encodeURIComponent(p)).join('/')
    thisPathTreeNode[variantPath] = true
    variantFn(v, thisPathComponents.concat(v.name), exhibit)
  })
  const childPathTrees = Object.values(variantGroup.variantGroups).map(g => traverseGroup(exhibit, g, thisPathComponents, variantGroupFn, variantFn))
  childPathTrees.forEach(childPathTree => Object.entries(childPathTree).forEach(([k, v]) => thisPathTreeNode[k] = v))
  return pathTree
}

const traverse = (
  exhibits: ComponentExhibits,
  exhibitGroupFn: (exhibits: ComponentExhibits, path: string[]) => void,
  variantGroupFn: (vg: VariantGroup, path: string[]) => void,
  variantFn: (v: Variant, path: string[], exhibit: ComponentExhibit) => void,
): PathTree => {
  const exhibitList = Object.values(exhibits)
  const ungroupedExhibits: ComponentExhibits = {}
  const groupNameToExhibits: { [groupName: string]: ComponentExhibits } = {}
  const groupNames: string[] = exhibitList.reduce<string[]>((acc, e) => {
    if (e.groupName == null) {
      ungroupedExhibits[e.name] = e
      return acc
    }

    if (groupNameToExhibits[e.groupName] == null)
      groupNameToExhibits[e.groupName] = {}

    groupNameToExhibits[e.groupName][e.name] = e
    return acc.indexOf(e.groupName) === -1 ? acc.concat(e.groupName) : acc
  }, [])

  const pathTree: PathTree = {}
  const groupNameToUriEncodedDict: {[groupName: string]: string } = {}
  groupNames.forEach(s => groupNameToUriEncodedDict[s] = encodeURIComponent(s))

  // Run fn for each exhibit group
  groupNames.forEach(groupName => {
    pathTree[groupNameToUriEncodedDict[groupName]] = {}
    exhibitGroupFn(groupNameToExhibits[groupName], [groupName])
  })

  exhibitList.forEach(e => {
    const basePathComponents = e.groupName != null ? [e.groupName] : []
    const pathTreeToPopulate = (e.groupName != null
      ? pathTree[groupNameToUriEncodedDict[e.groupName]]
      : pathTree) as PathTree
    if (e.hasProps) {
      const childPathTree = traverseGroup(e, e, basePathComponents, variantGroupFn, variantFn)
      Object.entries(childPathTree).forEach(([k, v]) => pathTreeToPopulate[k] = v)
      // If show default variant, then we add on another "virtual" variant with the default props of the exhibit
      if (e.defaultProps != null && e.showDefaultVariant) {
        const childPathTreeKey = Object.keys(childPathTree)[0]
        const defaultVariantPathComponents = basePathComponents.concat([e.name, 'Default'])
        const defaultVariantPath = defaultVariantPathComponents.map(p => encodeURIComponent(p)).join('/');
        (pathTreeToPopulate[childPathTreeKey] as PathTree)[defaultVariantPath] = true
        variantFn({ name: 'Default', props: e.defaultProps }, defaultVariantPathComponents, e)
      }
    }
    // Special case where component has no props, then the exhibit becomes the variant
    else {
      const path = basePathComponents.concat(e.name).map(p => encodeURIComponent(p)).join('/')
      pathTreeToPopulate[path] = true
      variantFn({ name: e.name, props: undefined }, basePathComponents.concat([e.name]), e)
    }
  })

  return pathTree
}

const nonRootExhibit = (
  defaultProps: any,
  variantGroup: VariantGroup,
) => {
  let _defaultProps: any = defaultProps
  const _nonRootExhibit: NonRootComponentExhibitBuilder<ReactComponentWithProps, boolean, boolean, boolean, any> = {
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

const mapPathComponentsToUrlPathString = (p: string[]) => p.map(_p => encodeURIComponent(_p)).join('/')

export const resolve = (
  exhibits: ComponentExhibits,
): { nodes: ExhibitNodes, pathTree: PathTree } => {
  const nodes: ExhibitNodes = {}

  const pathTree = traverse(
    exhibits,
    (_exhibits, pathComponents) => {
      const path = mapPathComponentsToUrlPathString(pathComponents)
      nodes[path] = {
        type: ExhibitNodeType.EXHIBIT_GROUP,
        groupName: pathComponents[0],
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
    (variant, pathComponents, _exhibit) => {
      const path = mapPathComponentsToUrlPathString(pathComponents)
      nodes[path] = {
        type: ExhibitNodeType.VARIANT,
        exhibit: _exhibit,
        variant,
        path,
        pathComponents,
      }
    },
  )

  return { nodes, pathTree }
}

export const exhibit = <
  TReactComponent extends ReactComponent
>(
    renderFn: TReactComponent,
    name: string,
  ): ComponentExhibitBuilder<TReactComponent, false, false, false, false, undefined> => {
  let eventProps: any = null
  let defaultProps: any = null
  let options: any = null
  let testSrcPath: string = null
  const variants: { [variantName: string]: Variant } = {}

  const hasProps = renderFn.length > 0

  const variantGroups: { [variantGroupName: string]: VariantGroup } = {}

  const componentExhibitBuilder: ComponentExhibitBuilder<TReactComponent, false, false, false, false, undefined> = {
    tests: _testSrcPath => {
      testSrcPath = _testSrcPath
      delete (componentExhibitBuilder as any).tests
      return componentExhibitBuilder
    },
    options: _options => {
      options = _options
      delete (componentExhibitBuilder as any).options
      return componentExhibitBuilder
    },
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
        showDefaultVariant: options?.showDefaultVariant ?? true,
        hasProps,
        renderFn,
        defaultProps,
        eventProps,
        variants,
        variantGroups,
        srcPath: (window as any).exhibitSrcPath,
        testSrcPath,
      }

      // TODO: This is kind of a workaround. It could all be a lot more robust and tidier.
      const exhibitKey = componentExhibit.groupName != null ? `${componentExhibit.groupName}%${componentExhibit.name}` : componentExhibit.name

      __exhibits[exhibitKey] = componentExhibit

      return componentExhibit as any
    },
  }

  return componentExhibitBuilder
}
