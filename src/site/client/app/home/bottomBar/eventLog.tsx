import React from 'react'
import { ComponentExhibit, Variant } from '../../../../../api/exhibit/types'
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

const getCircularReplacer = () => {
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

const EventLogItemEl = (props: {
  item: EventLogItem,
}) => {
  return <div className="item">
    <div className="id">{props.item.id}</div>
    <div className="path">{props.item.path}</div>
  </div>
}

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
          return <EventLogItemEl item={item} />
        })}
    </div>
  )
}

export default render
