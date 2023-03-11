import exhibit from '../../api'
import Component, { DEFAULT_PROPS, NAME } from '.'
import { GROUP_NAME } from '../common'

export const selectExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .defaults(DEFAULT_PROPS)
  .tests('e2e.spec.ts')
  .variant('3 options', {
    options: [
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
    ],
  })
  .variant('many options', {
    options: [
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
    ],
  })
  .variant('wide options', {
    options: [
      { displayText: 'London London London London London London London London London London London London London London London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
    ],
  })
  .variant('many & wide options', {
    options: [
      { displayText: 'London London London London London London London London London London London London London London London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London London London London London London London London London London London London London London London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London London London London London London London London London London London London London London London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London London London London London London London London London London London London London London London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London London London London London London London London London London London London London London London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London London London London London London London London London London London London London London London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London London London London London London London London London London London London London London London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London London London London London London London London London London London London London London London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London London London London London London London London London London London London London London London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London London London London London London London London London London London London London London London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
      { displayText: 'London London London London London London London London London London London London London London London', value: 'LON' },
      { displayText: 'New York', value: 'NYC' },
      { displayText: 'Paris', value: 'PAR' },
    ],
  })
  .build()
