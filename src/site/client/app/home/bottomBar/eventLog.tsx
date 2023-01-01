import { prettyDOM } from '@testing-library/dom'
import { createDataType } from '@textea/json-viewer'
import React from 'react'

import { ComponentExhibit, Variant } from '../../../../../api/exhibit/types'
import JsonViewer from '../../../common/jsonViewer'
import { EventLogItem, eventLogService } from '../../../services/eventLogService'
import { useAppSelector } from '../../../store'

export const deepSetAllPropsOnMatch = (objTruther: any, objToModify: any, val: (props: any[], path: string) => void, pathToHere?: string): any => {
  if (objTruther == null)
    return objToModify

  Object.keys(objTruther).forEach(prop => {
    const thisPath = pathToHere == null ? prop : `${pathToHere}.${prop}`
    if (objTruther[prop] === true) {
      const originalFn = objToModify[prop]
      objToModify[prop] = (...args: any[]) => {
        val(args, thisPath)
        originalFn(args)
      }
    }
    else if (typeof objTruther[prop] === 'object') {
      deepSetAllPropsOnMatch(objTruther[prop], objToModify[prop], val, thisPath)
    }
  })

  return objToModify
}

const EventArgValueEl = (props: {
  arg: any
}) => {
  try {
    return (
      <JsonViewer
        value={props.arg}
        indentWidth={2}
        displayDataTypes={false}
        rootName={false}
        maxDisplayLength={5}
        quotesOnKeys={false}
        defaultInspectDepth={0}
        editable={false}
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

const EventLogItemEl = (props: {
  item: EventLogItem,
  id: string | number
}) => (
  <div className="item">
    <div className="id">{props.item.id}</div>
    <div className="path">{props.item.path}</div>
    (
    {props.item.args.map((arg, i) => (
      <div className="arg" key={i}><EventArgValueEl arg={arg} /></div>
    ))}
    )
  </div>
)

export const render = (props: {
  exhibit: ComponentExhibit<true>
  variant: Variant
}) => {
  const events = useAppSelector(s => s.componentExhibits.events)

  return (
    <div className="event-log">
      {events.length === 0
        ? <div className="no-events">[No Events]</div>
        : events.map(eventId => {
          const item = eventLogService.items[eventId]
          return <EventLogItemEl item={item} id={item.id} key={item.id} />
        })}
    </div>
  )
}

export default render
