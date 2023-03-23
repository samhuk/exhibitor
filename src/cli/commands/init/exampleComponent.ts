import * as fs from 'fs'
import { createGFError, GFError } from 'good-flow'

const createError = (inner: GFError): GFError => createGFError({
  msg: 'Could not create example component',
  inner,
})

export const createExampleComponentCode = (): GFError | null => {
  try {
    if (!fs.existsSync('./src/button'))
      fs.mkdirSync('./src/button', { recursive: true })
  }
  catch (e: any) {
    return createError(createGFError({
      msg: c => `Could not create ${c.cyan('./src/button')} directory.`,
      inner: e,
    }))
  }

  const buttonComponentCode = `import React from 'react'
import './index.scss'

export const render = (props: {
  text: string
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  color?: 'default' | 'red' | 'yellow' | 'green' | 'blue'
}) => {
  const color = props.color ?? 'default'

  const onClick: React.MouseEventHandler<HTMLButtonElement> = e => {
    props.onClick(e)
  }

  return (
    <button
      className={\`cl-button color-\${color}\`}
      type="button"
      onClick={onClick}
    >
      {props.text}
    </button>
  )
}

export default render`
  try {
    fs.writeFileSync('./src/button/index.tsx', buttonComponentCode)
  }
  catch (e: any) {
    return createError(createGFError({
      msg: c => `Could not create ${c.cyan('./src/button/index.tsx')} file.`,
      inner: e,
    }))
  }

  const buttonComponentScssCode = `$bg-color: #fff;
$border: 1px solid #ccc;
$border-radius: 5px;

.cl-button {
  background-color: $bg-color;
  border: $border;
  border-radius: $border-radius;
  cursor: pointer;
  padding: 5px 10px;

  &:hover {
    background-color: darken($bg-color, 10)
  }

  &.color-green {
    background-color: green;
    color: #fff;
  }

  &.color-yellow {
    background-color: yellow;
    color: #fff;
  }

  &.color-red {
    background-color: red;
    color: #fff;
  }
  
  &.color-blue {
    background-color: blue;
    color: #fff;
  }
}`
  try {
    fs.writeFileSync('./src/button/index.scss', buttonComponentScssCode)
  }
  catch (e: any) {
    return createError(createGFError({
      msg: c => `Could not create ${c.cyan('./src/button/index.scss')} file.`,
      inner: e,
    }))
  }

  const buttonComponentExhibitCode = `import exhibit from 'exhibitor'
import Button from '.'

exhibit(Button, 'Button')
  .events({
    onClick: true,
  })
  .defaults({
    onClick: () => undefined,
    text: 'Button Text',
    color: 'default',
  })
  .variant('green', p => ({
    ...p,
    color: 'green',
  }))
  .variant('yellow', p => ({
    ...p,
    color: 'yellow',
  }))
  .variant('red', p => ({
    ...p,
    color: 'red',
  }))
  .variant('blue', p => ({
    ...p,
    color: 'blue',
  }))
  .build()`
  try {
    fs.writeFileSync('./src/button/index.exh.ts', buttonComponentExhibitCode)
  }
  catch (e: any) {
    return createError(createGFError({
      msg: c => `Could not create ${c.cyan('./src/button/index.exh.ts')} file.\n${e.message}`,
      inner: e,
    }))
  }

  return null
}
