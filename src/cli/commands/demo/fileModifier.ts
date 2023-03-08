type SectionToggles = { [name: string]: boolean }

type Parameters = { [name: string]: string|number }

type Options = {
  sectionToggles?: SectionToggles
  parameters?: Parameters
}

const regexEscapeName = (name: string) => name.replace(/\./g, '\\.')

const applySectionToggle = (fileText: string, name: string, enabled: boolean): string => {
  const regexEscapedName = regexEscapeName(name)
  const startRegexString = `^\\s*# START ${regexEscapedName}\n`
  const endRegexString = `^\\s*# END ${regexEscapedName}\n`
  const middleRegexString = '((.|\\s)*?)'
  const regexString = `${startRegexString}${middleRegexString}${endRegexString}`
  const regex = new RegExp(regexString, 'gm')
  return fileText.replace(regex, (match, group1) => (enabled ? group1 : ''))
}

const applySectionToggles = (fileText: string, sectionToggles: SectionToggles): string => {
  let result = fileText
  Object.entries(sectionToggles).forEach(([name, enabled]) => {
    result = applySectionToggle(result, name, enabled)
  })
  return result
}

const applyParameters = (fileText: string, parameters: Parameters): string => {
  let result = fileText
  Object.entries(parameters).forEach(([name, value]) => {
    const regexEscapedName = regexEscapeName(name)
    const regex = new RegExp(`\\\${${regexEscapedName}}`, 'g')
    result = result.replace(regex, typeof value === 'string' ? value : value.toString())
  })
  return result
}

export const modifyFileText = (fileText: string, options: Options): string => {
  let result = fileText
  if (options.sectionToggles != null)
    result = applySectionToggles(result, options.sectionToggles)
  if (options.parameters != null)
    result = applyParameters(result, options.parameters)
  return result
}
