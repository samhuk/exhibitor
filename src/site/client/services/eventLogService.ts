import { OmitTyped } from '@samhuk/type-helpers'

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
    return item
  },
  clear: () => {
    eventLogService.items = {}
    resetId()
  },
  remove: id => delete eventLogService.items[id],
}
