import exhibit, { simpleTextInputModifier } from '../../api'
import Component, { DEFAULT_PROPS, NAME } from '.'
import { GROUP_NAME } from '../common'

const href = 'https://github.com/samhuk/exhibitor/discussions'

export const externalLinkExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .defaults(DEFAULT_PROPS)
  .events({
    onClick: true,
  })
  .tests('e2e.spec.ts')
  .propModifiers([
    simpleTextInputModifier('text'),
    simpleTextInputModifier('href'),
  ])
  .variant('Small text length', {
    text: 'Discussion',
    href,
  })
  .variant('Medium text length', {
    text: 'Medium-text-length external link.',
    href,
  })
  .variant('Large text length', {
    text: 'This is an external link with a very long text argument. It should look okay.',
    href,
  })
  .variant('With icon', {
    text: 'Discussion',
    iconClass: 'fas fa-comments',
    href,
  })
  .build()
