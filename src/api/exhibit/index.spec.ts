import { exhibit } from '.'
import Toast, { ToastType } from '../../../test/componentLibrary/toast/toast'

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
      eventPropsSelector: null,
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
