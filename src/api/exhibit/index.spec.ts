import { resolve } from '.'

import { buttonExhibit } from '../../ui-component-library/button/index.exh'

import { counterExhibit } from '../../ui-component-library/counter/index.exh'

describe('exhibit', () => {
  test('resolve', () => {
    const fn = resolve

    const result = fn({
      [buttonExhibit.name]: buttonExhibit,
      [counterExhibit.name]: counterExhibit,
    })

    expect(result.pathTree).toEqual({
      'Exhibitor%20Library': {
        'Exhibitor%20Library/button': {
          'Exhibitor%20Library/button/Default': true,
          'Exhibitor%20Library/button/Icon%20only': true,
          'Exhibitor%20Library/button/Text%20%2B%20Icon': true,
          'Exhibitor%20Library/button/Text%20only': true,
        },
        'Exhibitor%20Library/counter': {
          'Exhibitor%20Library/counter/5': true,
          'Exhibitor%20Library/counter/50': true,
          'Exhibitor%20Library/counter/500': true,
          'Exhibitor%20Library/counter/5000': true,
          'Exhibitor%20Library/counter/Default': true,
        },
      },
    })
    expect(Object.keys(result.nodes)).toEqual([
      'Exhibitor%20Library',
      'Exhibitor%20Library/button',
      'Exhibitor%20Library/button/Text%20only',
      'Exhibitor%20Library/button/Icon%20only',
      'Exhibitor%20Library/button/Text%20%2B%20Icon',
      'Exhibitor%20Library/button/Default',
      'Exhibitor%20Library/counter',
      'Exhibitor%20Library/counter/5',
      'Exhibitor%20Library/counter/50',
      'Exhibitor%20Library/counter/500',
      'Exhibitor%20Library/counter/5000',
      'Exhibitor%20Library/counter/Default',
    ])
  })
})
