import { exhibit } from '.'

import Button from '../../../ui-component-library/button/index'

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
        component: Button,
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
})
