import React from 'react'
import Alert, { AlertColor } from '@mui/material/Alert'
import exhibit from '../../src/api'
import { PropModifierType } from '../../src/api/exhibit/propModifier/types'
import { simpleCheckboxModifier } from '../../src/api/exhibit/propModifier/checkbox'
import { simpleNumberInputModifier } from '../../src/api/exhibit/propModifier/numberInput'
import { simpleNumberSliderModifier } from '../../src/api/exhibit/propModifier/numberSlider'
import { simpleSelectModifier } from '../../src/api/exhibit/propModifier/select'

// eslint-disable-next-line react/jsx-props-no-spreading
exhibit((props: Parameters<typeof Alert>[0]) => <Alert {...props}>{props.children}</Alert>, 'Alert')
  .options({
    group: 'MUI',
  })
  .events({
    onClick: true,
  })
  .defaults({
    variant: 'standard',
    children: 'This is an alert — check it out!',
  })
  .propModifiers([
    simpleSelectModifier('variant', ['standard', 'filled', 'outlined']),
    simpleSelectModifier('severity', ['success', 'info', 'warning', 'error']),
    {
      label: 'Alert text',
      type: PropModifierType.TEXT_INPUT,
      init: props => props.children.toString(),
      apply: (newAlertText, currentProps) => ({ ...currentProps, children: newAlertText }),
    },
    simpleCheckboxModifier('square'),
    simpleNumberSliderModifier('elevation', { min: 1, max: 24, step: 3 }),
    simpleNumberInputModifier('elevation', { min: 1, max: 24, step: 3 }),
  ])
  .variant('error', p => ({
    ...p,
    severity: 'error',
  }))
  .variant('warning', p => ({
    ...p,
    severity: 'warning',
  }))
  .variant('info', p => ({
    ...p,
    severity: 'info',
  }))
  .variant('success', p => ({
    ...p,
    severity: 'success',
  }))
  .build()
