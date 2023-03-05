import { BuildResult } from 'esbuild'
import * as fs from 'fs'
import * as path from 'path'
import { createExhError } from './exhError'

const convertOutputPathToHref = (outputPath: string, serverRootDir: string): string => {
  const relativizedPath = path.relative(serverRootDir, outputPath)
  return `/${relativizedPath}`
}

const jsFile = (href: string) => (
  `<script async="" defer="" src="${href}"></script>`
)

const cssFile = (href: string) => (
  `<link href="${href}" rel="stylesheet">`
)

const icoFile = (href: string) => (
  `<link href="${href}" rel="icon" type="image/x-icon">`
)

// const isThemeStylesheet = (outputPath: string): boolean => {
//   for (let i = 0; i < THEMES.length; i += 1) {
//     if (outputPath.endsWith(`${THEMES[i]}.css`))
//       return true
//   }
//   return false
// }

const createFileElementText = (outputPath: string, serverRootDir: string): string => {
  // // These are dynamically included with Javascript according to the user's preferences
  // if (isThemeStylesheet(outputPath))
  //   return

  const href = convertOutputPathToHref(outputPath, serverRootDir)
  const fileExtension = path.extname(outputPath).slice(1)

  switch (fileExtension) {
    case 'js':
      return jsFile(href)
    case 'css':
      return cssFile(href)
    case 'ico':
      return icoFile(href)
    default:
      return null
  }
}

/**
 * Rudimentary copy of the HtmlPlugin of webpack. Creates a HTML file for the given
 * build result and html index file, adding <script> and <link> elements to reference
 * the output files.
 */
export const createIndexHtmlFileText = (
  result: BuildResult,
  faviconOutputPath: string | null,
  indexHtmlFilePath: string,
  serverRootDir: string,
): string => {
  let originalHtmlFileText: string = null
  try {
    originalHtmlFileText = fs.readFileSync(indexHtmlFilePath, { encoding: 'utf8' })
  }
  catch (e) {
    createExhError({ message: 'Could not access index.html file.' }).log()
    return ''
  }

  let dynamicContentText = Object.keys(result.metafile.outputs)
    .map(outputPath => createFileElementText(outputPath, serverRootDir))
    .filter(elText => elText != null)
    .join('\n    ')

  if (faviconOutputPath != null)
    dynamicContentText += icoFile(convertOutputPathToHref(faviconOutputPath, serverRootDir))

  return originalHtmlFileText.replace('{{DYNAMIC_CONTENT}}', dynamicContentText)
}
