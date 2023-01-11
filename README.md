<h1 align="center">exhibitor</h1>
<p align="center">
  <em>Snappy and delightful React component workshop</em>
</p>

<p align="center">
  <a href="https://github.com/samhuk/exhibitor/actions/workflows/build.yaml/badge.svg" target="_blank">
    <img src="https://github.com/samhuk/exhibitor/actions/workflows/build.yaml/badge.svg" alt="ci status" />
  </a>
  <a href="https://img.shields.io/badge/License-MIT-green.svg" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="license" />
  </a>
  <a href="https://badge.fury.io/js/ts-pg-orm.svg" target="_blank">
    <img src="https://badge.fury.io/js/ts-pg-orm.svg" alt="npm version" />
  </a>
</p>

<div align="center">
  <img src="./img/img1.png" />
</div>

## Overview

Exhibitor is a React component workshop. It allows you to see your individual React UI components in a hot-reloading website whilst you create them.

## Usage Overview

Exhibitor can be added to an existing React codebase that contains components or be used to bootstrap one from scratch. See the [Exhibitor Wiki](https://github.com/samhuk/exhibitor/wiki) for more information.

If you already have React components, using Exhibitor is as easy as this:

```
npm install --save-dev exhibitor
```

Declare exhibitions:

```typescript
// src/button.exh.ts (or .js, .jsx, .tsx, ...)
import exhibit from 'exhibitor'
import Button from './button' // I.e. button.tsx

exhibit(Button, 'Button')
  // Define any default values for props
  .defaults({
    onClick: () => undefined,
    color: 'default',
  })
  // Define which props correspond to events of the component
  .events({ onClick: true })
  // Define miscellaneous options
  .options({ group: 'Final Review' })
  // Define variants with varying prop values
  .variant('Green', defaultProps => ({
    ...defaultProps,
    color: 'green',
  }))
  // Group variants together
  .group('Large', ex => ex
    .defaults(p => {
      ...p,
      size: 'large'
    })
    .variant('Green', p => {
      ...p,
      color: 'green'
    }))
  .build()
```

Start exhibitor:

```
npx exhibitor start
```

## Major Features

* Extremely fast
* Simple
* Sane defaults
* Delightful Javascript API with Typescript-centric design for zero guesswork.
* esbuild
* Gives you the choice of React version to use
* Accessibility testing
* e2e testing integration **[Planned]**

## Development

Want to join in and contibute to Exhibitor? See [./contributing/development.md](./contributing/development.md).

---

If you would like to support my work, feel free to [buy me a coffee](https://www.buymeacoffee.com/samhuk) or sponsor me on GitHub ✨
