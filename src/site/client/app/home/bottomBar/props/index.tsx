import { prettyDOM } from '@testing-library/dom'
import { createDataType } from '@textea/json-viewer'
import React, { useState } from 'react'
import { ComponentExhibit, Variant } from '../../../../../../api/exhibit/types'
import HDivider from '../../../../../../ui-component-library/h-divider'
import JsonViewer from '../../../../common/jsonViewer'

import PropModifiers from './propModifiers'

export const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value))
        return '[Circular]'
      seen.add(value)
    }
    return value
  }
}

const PropsValueEl = (props: {
  value: any
}) => {
  try {
    return (
      <JsonViewer
        value={props.value}
        indentWidth={2}
        displayDataTypes={false}
        rootName={false}
        maxDisplayLength={10}
        quotesOnKeys={false}
        defaultInspectDepth={1}
        editable // TODO
        valueTypes={[
          // Handle HTML elements, which are generally horrible
          createDataType(
            v => v instanceof Node,
            // eslint-disable-next-line react/no-unstable-nested-components
            p => prettyDOM(p.value, 50, {
              maxDepth: 1,
              printFunctionName: false,
            }) as any,
          ),
          // Handle functions
          createDataType(
            v => typeof v === 'function',
            // eslint-disable-next-line react/no-unstable-nested-components
            () => '[Function]' as any,
          ),
          // Handle symbols, which cause exceptions
          createDataType(
            v => typeof v === 'symbol',
            // eslint-disable-next-line react/no-unstable-nested-components
            p => (p.value as Symbol).toString() as any,
          ),
        ]}
      />
    )
  }
  catch (e) {
    console.error(e)
    return <span>[Display error occured. See console.]</span>
  }
}

export const render = (props: {
  exhibit: ComponentExhibit<true>
  variant: Variant
}) => {
  const [customVariantProps, setCustomVariantProps] = useState<{ forVariant: Variant, props: any }>(undefined)

  if (customVariantProps != null && customVariantProps.forVariant !== props.variant)
    setCustomVariantProps(undefined)

  return (
    <div className="props">
      <PropsValueEl value={customVariantProps?.props ?? props.variant.props} />
      {props.exhibit.propModifiers != null && props.exhibit.propModifiers.length > 0
        ? (
          <>
            <HDivider />
            <PropModifiers
              exhibit={props.exhibit}
              variant={props.variant}
              onChange={newProps => setCustomVariantProps({ forVariant: props.variant, props: newProps })}
            />
          </>
        ) : null}
    </div>
  )
}

export default render