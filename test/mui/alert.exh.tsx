import React from 'react'
import Alert from '@mui/material/Alert'
import exhibit from '../../src/api'

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
