import * as pw from '@playwright/test'

console.log('updating pwTest')
const originalPwTest = pw.test

// // @ts-ignore
// pw.test = (...args: any) => {
//   console.log('======================== CUSTOM CONSOLE.LOG() ==========================')
//   // @ts-ignore
//   pw.test(...args)
// }

// @ts-ignore
window.test = (...args: any) => {
  console.log('======================== CUSTOM CONSOLE.LOG() ==========================')
  // @ts-ignore
  pw.test(...args)
}
console.log('updated pwTest')
console.log('updating pwTest')
console.log('importing button test')

const a = require('./button/button.spec')

console.log('imported button test')
