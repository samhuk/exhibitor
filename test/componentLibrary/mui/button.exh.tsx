import React from 'react'
import Button from '@mui/material/Button'
import exhibit from '../../../src/api'

exhibit((props: Parameters<typeof Button>[0]) => <Button {...props}>{props.children}</Button>, 'Button')
  .options({
    group: 'MUI',
  })
  .defaults({
    variant: 'contained',
    children: 'Hello World!!!!!!',
  })
  .build()