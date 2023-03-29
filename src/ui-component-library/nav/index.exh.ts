import exhibit from '../../api/react'
import Component, { DEFAULT_PROPS, NAME } from '.'
import { GROUP_NAME } from '../common'

export const navExhibit = exhibit(Component, NAME)
  .options({ group: GROUP_NAME })
  .defaults(DEFAULT_PROPS)
  // .tests('e2e.spec.ts')
  .variant('1 item', {
    navItems: [
      { text: 'Home', iconName: 'home', onClick: () => console.log('clicked'), active: true },
    ],
  })
  .variant('2 items', {
    navItems: [
      { text: 'Home', iconName: 'home', onClick: () => console.log('clicked'), active: true },
      { text: 'User Profile', iconName: 'user', onClick: () => console.log('clicked') },
    ],
  })
  .variant('4 items', {
    navItems: [
      { text: 'Home', iconName: 'home', onClick: () => console.log('clicked'), active: true },
      { text: 'User Profile', iconName: 'user', onClick: () => console.log('clicked') },
      { text: 'Home', iconName: 'home', onClick: () => console.log('clicked') },
      { text: 'User Profile', iconName: 'user', onClick: () => console.log('clicked') },
    ],
  })
  .variant('8 items', {
    navItems: [
      { text: 'Home', iconName: 'home', onClick: () => console.log('clicked') },
      { text: 'User Profile', iconName: 'user', onClick: () => console.log('clicked') },
      { text: 'Home', iconName: 'home', onClick: () => console.log('clicked'), active: true },
      { text: 'User Profile', iconName: 'user', onClick: () => console.log('clicked') },
      { text: 'Home', iconName: 'home', onClick: () => console.log('clicked') },
      { text: 'User Profile', iconName: 'user', onClick: () => console.log('clicked') },
      { text: 'Home', iconName: 'home', onClick: () => console.log('clicked') },
      { text: 'User Profile', iconName: 'user', onClick: () => console.log('clicked') },
      { text: 'Home', iconName: 'home', onClick: () => console.log('clicked') },
      { text: 'User Profile', iconName: 'user', onClick: () => console.log('clicked') },
    ],
  })
  .variant('8 items (only icons)', {
    navItems: [
      { iconName: 'home', onClick: () => console.log('clicked') },
      { iconName: 'user', onClick: () => console.log('clicked') },
      { iconName: 'home', onClick: () => console.log('clicked'), active: true },
      { iconName: 'user', onClick: () => console.log('clicked') },
      { iconName: 'home', onClick: () => console.log('clicked') },
      { iconName: 'user', onClick: () => console.log('clicked') },
      { iconName: 'home', onClick: () => console.log('clicked') },
      { iconName: 'user', onClick: () => console.log('clicked') },
      { iconName: 'home', onClick: () => console.log('clicked') },
      { iconName: 'user', onClick: () => console.log('clicked') },
    ],
  })
  .build()
