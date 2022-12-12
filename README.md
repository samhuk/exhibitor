<h1 align="center">exhibitor</h1>
<p align="center">
  <em>Snappy and delightful React component workshop</em>
</p>

<p align="center">
  <a href="https://img.shields.io/badge/License-MIT-green.svg" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="license" />
  </a>
</p>

**exhibitor is in beta.**

![](./img/img1.png)

## Overview

exhibitor is an extremely fast React component workshop with an easy-to-use Javascript API and Website.

## Usage Overview

Install:

```
npm i -S exhibitor
```

Have a standard React component:

```tsx
// src/button.tsx
import './button.scss'
export const render = (props: { onClick: ..., color: ... }) => (
  <button>...</button>
)
export default render
```

Declare exhibitions of your components with the Javascript API:

```typescript
// src/button.exh.ts
import exhibit from 'exhibitor'
import Button from './button'

exhibit(Button, 'Button', { group: 'Final Review' })
  .events({
    onClick: true,
  })
  .defaults({
    onClick: () => console.log('click!!'),
    color: 'default',
    ...
  })
  .variant('green', p => ({
    ...p,
    color: 'green',
  }))
  .build()
```

Start exhibitor:

```
npx exhibitor start
```

Navigate to http://localhost:4001 to see your component exhibitions.

Optionally define a configuration file for the `start` command:

```jsonc
// exh.config.json
{
  "include": ["./src/**/*.exh.ts"],
  "watch": ["./src/**/*"],
  "rootStyle": "./src/styles/index.scss",
  ...
}
```

```
npx exhibitor start -c ./exh.config.json
```
## Major Features

* Extremely fast
* Simple
* Sane defaults
* Delightful Javascript API with Typescript-centric design for zero guesswork.
* esbuild
* e2e testing integration **[Planned]**

## Development

See [./contributing/development.md](./contributing/development.md)

---

If you would like to support my work, feel free to [buy me a coffee](https://www.buymeacoffee.com/samhuk) or sponsor me on GH ✨
