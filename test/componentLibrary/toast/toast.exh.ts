import exhibit from '../../../src/api'
import Toast, { ToastType } from './toast'

exhibit(Toast, 'Toast')
  .defaults({
    text: '',
    type: ToastType.INFO,
  })
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
  })
  .variant('Long text', {
    // eslint-disable-next-line max-len
    text: 'You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way. You can do this a better way.',
    type: ToastType.INFO,
  })
  .variant('Short text', {
    // eslint-disable-next-line max-len
    text: 'No.',
    type: ToastType.INFO,
  })
  .variant('With close button', {
    // eslint-disable-next-line max-len
    text: 'You can do this a better way',
    showCloseButton: true,
    onCloseButtonClick: () => undefined,
    type: ToastType.INFO,
  })
  .build()
