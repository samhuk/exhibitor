import React from 'react'
import Alert, { AlertColor } from '@mui/material/Alert'
import exhibit from '../../src/api'
import { PropModifierType } from '../../src/api/exhibit/propModifier/types'

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
    {
      label: 'Variant',
      type: PropModifierType.SELECT,
      options: ['standard', 'filled', 'outlined'],
      init: props => props.variant,
      apply: (newVariant, currentProps) => ({ ...currentProps, variant: newVariant as 'standard' | 'filled' | 'outlined' }),
    },
    {
      label: 'Severity',
      type: PropModifierType.SELECT,
      options: ['success', 'info', 'warning', 'error'],
      init: props => props.severity,
      apply: (newSeverity, currentProps) => ({ ...currentProps, severity: newSeverity as AlertColor }),
    },
    {
      label: 'Alert text',
      type: PropModifierType.TEXT_INPUT,
      init: props => props.children.toString(),
      apply: (newAlertText, currentProps) => ({ ...currentProps, children: newAlertText }),
    },
    {
      label: 'Square',
      type: PropModifierType.CHECKBOX,
      init: props => props.square,
      apply: (newEnabled, currentProps) => ({ ...currentProps, square: newEnabled }),
    },
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
