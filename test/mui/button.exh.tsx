import React from 'react'
import Button from '@mui/material/Button'
import exhibit, { PropModifierType } from '../../src/api'

// eslint-disable-next-line react/jsx-props-no-spreading
exhibit((props: Parameters<typeof Button>[0]) => <Button {...props}>{props.children}</Button>, 'Button')
  .options({
    group: 'MUI',
  })
  .events({
    onClick: true,
  })
  .defaults({
    variant: 'contained',
    children: 'Button Text',
  })
  .propModifiers([
    {
      label: 'Text',
      type: PropModifierType.TEXT_INPUT,
      init: props => props.children.toString(),
      apply: (newValue, currentProps) => ({ ...currentProps, children: newValue }),
    },
  ])
  .build()
