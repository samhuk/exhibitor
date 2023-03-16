import exhibit, { simpleTextInputModifier } from '../../api'
import Component, { NAME } from '.'
import { GROUP_NAME } from '../common'

export const textInputExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .events({
    onChange: true,
  })
  .defaults({
    label: '[Label]',
  })
  .propModifiers([
    simpleTextInputModifier('label'),
    simpleTextInputModifier('placeholder'),
  ])
  .build()
