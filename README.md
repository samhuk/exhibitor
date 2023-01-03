<h1 align="center">exhibitor</h1>
<p align="center">
  <em>Snappy and delightful React component workshop</em>
</p>

<p align="center">
  <a href="https://img.shields.io/badge/License-MIT-green.svg" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="license" />
  </a>
</p>

<div align="center">
  <img src="./img/img1.png" />
</div>

## Overview

Exhibitor is a React component workshop. It allows you to see your individual React UI components in a hot-reloading website whilst you create them.

## Usage Overview

Exhibitor can be added to an existing React codebase that contains components or be used to bootstrap one from scratch. Ensure you have [Node.js version >14.x](https://nodejs.org/en/) installed.

### From scratch

For MacOS and Linux (and WSL):

```bash
mkdir my-component-library &&\
  cd my-component-library &&\
  npm init -y &&\
  npm i -S exhibitor &&\
  npx exhibitor init
```

This will create a new directory called "my-component-library" and initialize a basic React component library with Exhibitor integration.

For Windows:

```batch
mkdir my-component-library && cd my-component-library && npm init -y && npm i -S exhibitor && npx exhibitor init
```

### Existing codebase

Ensure your existing React codebase has `react` and `react-dom` installed, i.e. `npm i -S react react-dom`.

```
npm i -S exhibitor
```

For a functional React component:

```tsx
// src/button.tsx
import React from 'react'
import './button.scss'
export const render = (props: { onClick: ..., color: ... }) => (
  <button>...</button>
)
export default render
```

Declare exhibitions with the Exhibitor Javascript API:

```typescript
// src/button.exh.ts
import exhibit from 'exhibitor'
import Button from './button'

exhibit(Button, 'Button')
  // Define any default values for props
  .defaults({
    onClick: () => undefined,
    color: 'default',
    ...
  })
  // Define which props correspond to events of the component
  .events({
    onClick: true,
  })
  // Define miscellaneous options
  .options({ group: 'Final Review' })
  // Define variants with varying prop values
  .variant('Green', defaultProps => ({
    ...defaultProps,
    color: 'green',
  }))
  ...
  // Group variants together
  .group('Large', ex => ex
    .defaults(p => {
      ...p,
      size: 'large'
    })
    .variant('Green', p => {
      ...p,

    })
    ...
  ...
  .build()
```

Start exhibitor:

```
npx exhibitor start
```

Optionally define a configuration file for the Exhibitor CLI:

```jsonc
// exh.config.json
{
  "$schema": "https://raw.githubusercontent.com/samhuk/exhibitor/master/src/cli/config/schema.json", 
  "include": ["./src/**/*.exh.ts"],
  "watch": ["./src/**/*"],
  ...
}
```

## Major Features

* Extremely fast
* Simple
* Sane defaults
* Delightful Javascript API with Typescript-centric design for zero guesswork.
* esbuild
* Gives you the choice of React version to use
* e2e testing integration **[Planned]**

## Development

Want to join in and contibute to Exhibitor? See [./contributing/development.md](./contributing/development.md).

---

If you would like to support my work, feel free to [buy me a coffee](https://www.buymeacoffee.com/samhuk) or sponsor me on GitHub ✨
