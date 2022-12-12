import * as fs from 'fs'
import path from 'path'
import { exhibit, resolve } from '.'
import Toast, { ToastType } from '../../../test/componentLibrary/toast/toast'
import Button from '../../../test/componentLibrary/button/button'
import { buttonExhibit } from '../../../test/componentLibrary/button/button.exh'
import ButtonWithGeneric from '../../../test/componentLibrary/buttonWithGeneric/buttonWithGeneric'
import { buttonWithGenericExhibit } from '../../../test/componentLibrary/buttonWithGeneric/buttonWithGeneric.exh'
import IconButton from '../../../test/componentLibrary/iconButton/iconButton'
import { iconButtonExhibit } from '../../../test/componentLibrary/iconButton/iconButton.exh'
import TypedIcon from '../../../test/componentLibrary/icons/typedIcon'
import { typedIconExhibit } from '../../../test/componentLibrary/icons/typedIcon.exh'
import LoadingSpinner from '../../../test/componentLibrary/loadingSpinner/loadingSpinner'
import { loadingSpinnerExhibit } from '../../../test/componentLibrary/loadingSpinner/loadingSpinner.exh'
import { toastExhibit } from '../../../test/componentLibrary/toast/toast.exh'
import { ExhibitNodes, PathTree } from './types'

const expectedPathTree: PathTree = {
  GA: {
    'GA/IconButton': {
      'GA/IconButton/paper-plane': true,
    },
    'GA/TypedIcon': {
      'GA/TypedIcon/Success': true,
      'GA/TypedIcon/Warn': true,
      'GA/TypedIcon/Error': true,
      'GA/TypedIcon/Info': true,
    },
  },
  'Design%20Phase': {
    'Design%20Phase/LoadingSpinner': true,
    'Design%20Phase/Toast': {
      'Design%20Phase/Toast/W%2F%20close%20button': true,
      'Design%20Phase/Toast/W%2Fo%20close%20button': {
        'Design%20Phase/Toast/W%2Fo%20close%20button/Success': true,
        'Design%20Phase/Toast/W%2Fo%20close%20button/Warn': true,
        'Design%20Phase/Toast/W%2Fo%20close%20button/Error': true,
        'Design%20Phase/Toast/W%2Fo%20close%20button/Info': true,
      },
      'Design%20Phase/Toast/Variable%20Text%20Lengthsssss%20sss%20sss%20sss': {
        'Design%20Phase/Toast/Variable%20Text%20Lengthsssss%20sss%20sss%20sss/Long%20text': true,
        'Design%20Phase/Toast/Variable%20Text%20Lengthsssss%20sss%20sss%20sss/Short%20text': true,
      },
    },
  },
  Button: {
    'Button/green': true,
    'Button/yellow': true,
    'Button/red': true,
    'Button/blue': true,
    'Button/large': true,
    'Button/with%20icon': true,
  },
  ButtonWithGeneric: {
    'ButtonWithGeneric/green': true,
    'ButtonWithGeneric/yellow': true,
    'ButtonWithGeneric/red': true,
    'ButtonWithGeneric/blue': true,
    'ButtonWithGeneric/large': true,
    'ButtonWithGeneric/with%20icon': true,
  },
}

describe('exhibit', () => {
  describe('exhibit', () => {
    const fn = exhibit

    test('basic test', () => {
      const onCloseButtonClick = (): any => undefined
      const result = fn(Toast, 'Toast', { group: 'Design Phase' })
        .defaults({
          text: '',
          type: ToastType.INFO,
        })
        .group('W/o close button', ex => ex
          .variant('Success', {
            text: 'That completed successfully!',
            type: ToastType.SUCCESS,
          })
          .variant('Warn', {
            text: 'That completed but something bad occured!',
            type: ToastType.WARN,
          })
          .variant('Error', {
            text: 'That didn\'t complete successfully.',
            type: ToastType.ERROR,
          })
          .variant('Info', {
            text: 'You can do this a better way.',
            type: ToastType.INFO,
          }))
        .group('Variable Text Lengths', ex => ex
          .variant('Long text', {
            // eslint-disable-next-line max-len
            text: 'You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way.',
            type: ToastType.INFO,
          })
          .variant('Short text', {
            // eslint-disable-next-line max-len
            text: 'No.',
            type: ToastType.INFO,
          }))
        .variant('W/ close button', {
          // eslint-disable-next-line max-len
          text: 'You can do this a better way',
          showCloseButton: true,
          onCloseButtonClick,
          type: ToastType.INFO,
        })
        .build()

      expect(result).toEqual({
        defaultProps: {
          text: '',
          type: 'info',
        },
        eventProps: null,
        groupName: 'Design Phase',
        hasProps: true,
        name: 'Toast',
        renderFn: Toast,
        variantGroups: {
          'Variable Text Lengths': {
            name: 'Variable Text Lengths',
            variantGroups: {},
            variants: {
              'Long text': {
                name: 'Long text',
                props: {
                  // eslint-disable-next-line max-len
                  text: 'You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way.',
                  type: 'info',
                },
              },
              'Short text': {
                name: 'Short text',
                props: {
                  text: 'No.',
                  type: 'info',
                },
              },
            },
          },
          'W/o close button': {
            name: 'W/o close button',
            variantGroups: {},
            variants: {
              Error: {
                name: 'Error',
                props: {
                  text: "That didn't complete successfully.",
                  type: 'error',
                },
              },
              Info: {
                name: 'Info',
                props: {
                  text: 'You can do this a better way.',
                  type: 'info',
                },
              },
              Success: {
                name: 'Success',
                props: {
                  text: 'That completed successfully!',
                  type: 'success',
                },
              },
              Warn: {
                name: 'Warn',
                props: {
                  text: 'That completed but something bad occured!',
                  type: 'warn',
                },
              },
            },
          },
        },
        variants: {
          'W/ close button': {
            name: 'W/ close button',
            props: {
              onCloseButtonClick,
              showCloseButton: true,
              text: 'You can do this a better way',
              type: 'info',
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
      [buttonWithGenericExhibit.name]: buttonWithGenericExhibit,
      [iconButtonExhibit.name]: iconButtonExhibit,
      [typedIconExhibit.name]: typedIconExhibit,
      [loadingSpinnerExhibit.name]: loadingSpinnerExhibit,
      [toastExhibit.name]: toastExhibit,
    })

    // fs.writeFileSync('test.json', JSON.stringify(Object.keys(result.nodes), null, 2))

    expect(result.pathTree).toEqual(expectedPathTree)
    expect(Object.keys(result.nodes)).toEqual([
      'GA',
      'Design%20Phase',
      'Button',
      'Button/green',
      'Button/yellow',
      'Button/red',
      'Button/blue',
      'Button/large',
      'Button/with%20icon',
      'ButtonWithGeneric',
      'ButtonWithGeneric/green',
      'ButtonWithGeneric/yellow',
      'ButtonWithGeneric/red',
      'ButtonWithGeneric/blue',
      'ButtonWithGeneric/large',
      'ButtonWithGeneric/with%20icon',
      'GA/IconButton',
      'GA/IconButton/paper-plane',
      'GA/TypedIcon',
      'GA/TypedIcon/Success',
      'GA/TypedIcon/Warn',
      'GA/TypedIcon/Error',
      'GA/TypedIcon/Info',
      'Design%20Phase/LoadingSpinner',
      'Design%20Phase/Toast',
      'Design%20Phase/Toast/W%2F%20close%20button',
      'Design%20Phase/Toast/W%2Fo%20close%20button',
      'Design%20Phase/Toast/W%2Fo%20close%20button/Success',
      'Design%20Phase/Toast/W%2Fo%20close%20button/Warn',
      'Design%20Phase/Toast/W%2Fo%20close%20button/Error',
      'Design%20Phase/Toast/W%2Fo%20close%20button/Info',
      'Design%20Phase/Toast/Variable%20Text%20Lengthsssss%20sss%20sss%20sss',
      'Design%20Phase/Toast/Variable%20Text%20Lengthsssss%20sss%20sss%20sss/Long%20text',
      'Design%20Phase/Toast/Variable%20Text%20Lengthsssss%20sss%20sss%20sss/Short%20text',
    ])
  })
})
