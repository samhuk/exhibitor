import exhibit from '../../api'
import Component, { NAME } from '.'
import { GROUP_NAME } from '../common'

export const selectExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .build()