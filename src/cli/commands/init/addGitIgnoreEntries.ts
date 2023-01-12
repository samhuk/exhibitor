import * as fs from 'fs'
import { CliError, CliString } from '../../types'

const createError = (causedBy: CliString): CliError => ({
  message: 'Could not add git ignore entry.',
  causedBy,
})

export const addGitIgnoreEntries = (): CliError | null => {
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
    return createError(c => `Could not determine if git ignore file already exists (${c.cyan(gitIgnorePath)}) - ${e.message}`)
  }

  let newGitIgnoreContent: string
  if (alreadyExists) {
    let gitIgnoreContent: string
    try {
      gitIgnoreContent = fs.readFileSync(gitIgnorePath, { encoding: 'utf8' })
    }
    catch (e: any) {
      return createError(c => `Could not read in existing git ignore file content (${c.cyan(gitIgnorePath)}) - ${e.message}`)
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
    return createError(c => `Could not create new git ignore file (${c.cyan(gitIgnorePath)}) - ${e.message}`)
  }
  return null
}
