<h1 align="center">exhibitor</h1>
<p align="center">
  <em>Extremely fast React component workshop</em>
</p>

<p align="center">
  <a href="https://img.shields.io/badge/License-MIT-green.svg" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="license" />
  </a>
</p>

**exhibitor is in early alpha. Current state is not necessarily reflective of eventual release state. Production use is not advised.**

## Overview

exhibitor is an extremely fast React component workshop with an easy-to-use Javascript API and Website.

## Usage Overview

Install:

```
npm i -S exhibitor
```

Declare exhibitions of your components with the Javascript API:

```typescript
// src/button.exh.ts
import exhibit from 'exhibitor'

import Button from './button'

exhibit('button', Button)
  .events(p => ({
    onClick: p.onClick,
  }))
  .defaults({
    onClick: () => console.log('click!!'),
    color: 'default',
    ...
  })
  .variant('default', p => p)
  .variant('green', p => ({
    ...p,
    color: 'green',
  }))
  .build()
```

Using the CLI, view your exhibitions:

```
npx exhibitor start
```

## Major Features

* Extremely fast
* Simple
* Sane defaults
* e2e testing integration
* Delightful Javascript API with Typescript-centric design for zero guesswork.
* esbuild

## Development

See [./contributing/development.md](./contributing/development.md)

---

If you would like to support my work, feel free to [buy me a coffee](https://www.buymeacoffee.com/samhuk) or sponsor me on GH ✨
