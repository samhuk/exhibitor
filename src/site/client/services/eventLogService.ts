import { OmitTyped } from '@samhuk/type-helpers'
import store from '../store'
import { addEvent } from '../store/componentExhibits/actions'

export type EventLogItem = {
  id: number
  path: string
  args: any[]
}

export type EventLogItems = {
  [id: number]: EventLogItem
}

export type EventLogItemOptions = OmitTyped<EventLogItem, 'id'> & { id?: number }

export type EventLogService = {
  items: EventLogItems
  add: (item: EventLogItemOptions) => EventLogItem
  remove: (id: number) => void
  clear: () => void
}

let nextId = 0
const generateId = () => nextId += 1
const resetId = () => {
  nextId = 0
}

export const eventLogService: EventLogService = {
  items: { },
  add: itemOptions => {
    const item: EventLogItem = {
      id: itemOptions.id ?? generateId(),
      args: itemOptions.args,
      path: itemOptions.path,
    }
    eventLogService.items[item.id] = item
    store.dispatch(addEvent(item.id))
    return item
  },
  clear: () => {
    eventLogService.items = {}
    resetId()
  },
  remove: id => delete eventLogService.items[id],
};

// Make available on window object so that child comp-site iframe can access it
(window as any).eventLogService = eventLogService
