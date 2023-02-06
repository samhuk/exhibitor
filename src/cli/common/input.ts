import { exit } from 'process'
import readline from 'readline'
import { createExhError } from '../../common/exhError'
import { logError } from '../../common/logging'

const r1 = readline.createInterface({ input: process.stdin, output: process.stdout })

type Validator<TValue extends any = any> = {
  op: (s: TValue) => boolean
  errMsg: string
}

const VALIDATORS = {
  isNonEmptyString: { op: (s: string) => s != null && s.length > 0, errMsg: 'Cannot be empty' },
  hasNoSpaces: { op: (s: string) => s.indexOf(' ') === -1, errMsg: 'Cannot have whitespace' },
} as const

export const tryGetInput = (options: {
  question: string
  onComplete: (val: string) => void
  validators?: Validator<string>[]
  defaultIfEmpty: string
}) => {
  const _question = options.defaultIfEmpty != null ? `${options.question} [${options.defaultIfEmpty}]: ` : `${options.question}: `
  r1.question(_question, val => {
    const isEmpty = !VALIDATORS.isNonEmptyString.op(val)
    if (isEmpty && options.defaultIfEmpty != null) {
      options.onComplete(options.defaultIfEmpty)
      return
    }

    if (options.validators != null) {
      const errMsg = options.validators.find(validator => !validator.op(val))?.errMsg
      if (errMsg == null) {
        options.onComplete(val)
      }
      else {
        createExhError({ message: errMsg }).log()
        tryGetInput(options)
      }
    }
    else {
      options.onComplete(val)
    }
  })
}

export const askBooleanQuestion = (
  question: string,
  defaultIfEmpty?: boolean,
) => new Promise<boolean>((res, rej) => {
  tryGetInput({
    question,
    defaultIfEmpty: defaultIfEmpty != null
      ? defaultIfEmpty
        ? 'Y'
        : 'N'
      : undefined,
    onComplete: v => {
      res(['y', 'Y'].indexOf(v[0]) !== -1)
    },
    validators: [{
      op: v => ['y', 'Y', 'n', 'N'].indexOf(v[0]) !== -1,
      errMsg: 'Invalid answer.',
    }],
  })
})

export const askShouldContinue = (defaultIfEmpty: boolean = true) => askBooleanQuestion('Continue?', defaultIfEmpty)

export const askShouldContinueIfNotExit = async (defaultIfEmpty: boolean = true) => {
  const shouldContinue = await askShouldContinue(defaultIfEmpty)
  if (!shouldContinue)
    exit(1)
}
