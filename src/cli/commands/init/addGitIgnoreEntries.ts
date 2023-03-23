import * as fs from 'fs'
import { createGFError, GFError } from 'good-flow'

const createError = (inner: GFError): GFError => createGFError({
  msg: 'Could not add git ignore entry.',
  inner,
})

export const addGitIgnoreEntries = (): GFError | null => {
  const gitIgnorePath = './.gitignore'
  const gitIgnoreEntries: string[] = [
    '/node_modules',
    '/.exh',
  ]
  let alreadyExists: boolean
  try {
    alreadyExists = fs.existsSync(gitIgnorePath)
  }
  catch (e: any) {
    return createError(createGFError({
      msg: c => `Could not determine if git ignore file already exists (${c.cyan(gitIgnorePath)}).`,
      inner: e,
    }))
  }

  let newGitIgnoreContent: string
  if (alreadyExists) {
    let gitIgnoreContent: string
    try {
      gitIgnoreContent = fs.readFileSync(gitIgnorePath, { encoding: 'utf8' })
    }
    catch (e: any) {
      return createError(createGFError({
        msg: c => `Could not read in existing git ignore file content (${c.cyan(gitIgnorePath)}).`,
        inner: e,
      }))
    }
    const missingGitIgnoreEntries = gitIgnoreEntries.filter(entry => !gitIgnoreContent.split('\n').some(line => line.trim() === entry))
    newGitIgnoreContent = gitIgnoreContent.concat(missingGitIgnoreEntries.join('\n'))
  }
  else {
    newGitIgnoreContent = gitIgnoreEntries.join('\n')
  }

  try {
    fs.writeFileSync(gitIgnorePath, newGitIgnoreContent)
  }
  catch (e: any) {
    return createError(createGFError({
      msg: c => `Could not create new git ignore file (${c.cyan(gitIgnorePath)}).`,
      inner: e,
    }))
  }
  return null
}
