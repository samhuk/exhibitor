import * as fs from 'fs'
import path from 'path'
import { exhibit, resolve } from '.'

import Button from '../../ui-component-library/button/index'
import { buttonExhibit } from '../../ui-component-library/button/index.exh'

import Counter from '../../ui-component-library/counter/index'
import { counterExhibit } from '../../ui-component-library/counter/index.exh'

import { PathTree } from './types'

describe('exhibit', () => {
  describe('exhibit', () => {
    const fn = exhibit

    test('basic test', () => {
      const onClickFn = (e: any) => console.log(e)

      const result = fn(Button, 'button')
        .tests('./test.spec.ts')
        .options({
          group: 'Design Phase',
        })
        .defaults({
          children: '[button text]',
        })
        .group('Primary', ex => ex
          .variant('W/ onclick', {
            children: '[button text]',
            onClick: onClickFn,
          })
          .variant('W/o onclick', {
            children: '[button text]',
          }))
        .group('Varying text length', ex => ex
          .variant('Long text', {
            children: '[button text button text button text button text]',
          })
          .variant('Short text', {
            children: '[but]',
          }))
        .variant('Secondary', p => ({ ...p }))
        .build()

      expect(result).toEqual({
        defaultProps: {
          children: '[button text]',
        },
        eventProps: null,
        groupName: 'Design Phase',
        hasProps: true,
        name: 'button',
        propModifiers: [],
        renderFn: Button,
        showDefaultVariant: true,
        srcPath: undefined,
        testSrcPath: './test.spec.ts',
        variantGroups: {
          Primary: {
            name: 'Primary',
            variantGroups: {},
            variants: {
              'W/ onclick': {
                name: 'W/ onclick',
                props: {
                  children: '[button text]',
                  onClick: onClickFn,
                },
              },
              'W/o onclick': {
                name: 'W/o onclick',
                props: {
                  children: '[button text]',
                },
              },
            },
          },
          'Varying text length': {
            name: 'Varying text length',
            variantGroups: {},
            variants: {
              'Long text': {
                name: 'Long text',
                props: {
                  children: '[button text button text button text button text]',
                },
              },
              'Short text': {
                name: 'Short text',
                props: {
                  children: '[but]',
                },
              },
            },
          },
        },
        variants: {
          Secondary: {
            name: 'Secondary',
            props: {
              children: '[button text]',
            },
          },
        },
      })
    })
  })

  describe('resolve', () => {
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
    fs.writeFileSync('./data.json', JSON.stringify(Object.keys(result.nodes)))
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
