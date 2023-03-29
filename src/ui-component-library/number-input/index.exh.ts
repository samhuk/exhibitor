import exhibit from '../../api/react'
import Component, { NAME } from '.'
import { GROUP_NAME } from '../common'

export const numberInputExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .events({
    onChange: true,
  })
  .defaults({})
  .build()
