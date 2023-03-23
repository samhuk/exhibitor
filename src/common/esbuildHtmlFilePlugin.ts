import { BuildResult } from 'esbuild'
import * as fs from 'fs'
import { createGFError } from 'good-flow'
import { JSDOM } from 'jsdom'
import * as path from 'path'

const includeJsFile = (document: Document, href: string) => {
  const scriptEl = document.createElement('script')
  scriptEl.defer = true
  scriptEl.src = href
  document.head.appendChild(scriptEl)
}

const includeCssFile = (document: Document, href: string) => {
  const linkEl = document.createElement('link')
  linkEl.rel = 'stylesheet'
  linkEl.href = href
  document.head.appendChild(linkEl)
}

const includeIcoFile = (document: Document, href: string) => {
  const linkEl = document.createElement('link')
  linkEl.rel = 'icon'
  linkEl.href = href
  linkEl.type = 'image/x-icon'
  document.head.appendChild(linkEl)
}

const includeFile = (document: Document, serverRootDir: string, outputPath: string) => {
  // These are dynamically included
  if (outputPath.endsWith('dark.css') || outputPath.endsWith('light.css'))
    return

  const relativizedPath = path.relative(serverRootDir, outputPath)
  const href = `/${relativizedPath}`
  if (outputPath.endsWith('.js'))
    includeJsFile(document, href)
  else if (outputPath.endsWith('.css'))
    includeCssFile(document, href)
  else if (outputPath.endsWith('.ico'))
    includeIcoFile(document, href)
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
  let htmlFileText: string = null
  try {
    htmlFileText = fs.readFileSync(indexHtmlFilePath, { encoding: 'utf8' })
  }
  catch (e) {
    createGFError('Could not access index.html file.').log()
    return ''
  }
  const jsdom = new JSDOM(htmlFileText)
  const document = jsdom.window.document

  if (document.head == null)
    createGFError('index.html file does not have a <head> element. Please add one.').log()

  Object.entries(result.metafile.outputs).forEach(([outputPath]) => includeFile(document, serverRootDir, outputPath))

  if (faviconOutputPath != null)
    includeIcoFile(document, `/${path.relative(serverRootDir, faviconOutputPath)}`)

  return jsdom.serialize()
}
