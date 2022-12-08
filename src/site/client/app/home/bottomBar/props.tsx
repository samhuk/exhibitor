import { prettyDOM } from '@testing-library/dom'
import { createDataType, JsonViewer } from '@textea/json-viewer'
import React from 'react'

import { ComponentExhibit, Variant } from '../../../../../api/exhibit/types'

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
        maxDisplayLength={5}
        quotesOnKeys={false}
        defaultInspectDepth={1}
        editable={false} // TODO
        valueTypes={[
          // Handle elements, which are horrible
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
            p => '[Function]' as any,
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
}) => (
  <div className="props">
    <PropsValueEl value={props.variant.props} />
  </div>
)

export default render
