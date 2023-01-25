import { Data64URIReader, Entry, TextWriter, ZipReader } from '@zip.js/zip.js'
import { HTMLReport } from '../../../external/playwright-html-reporter/src/types'

export type PlaywrightTestZipReport = {
  json: () => HTMLReport
  entry: (name: string) => Promise<any>
}

const createZipReport = async (base64String: string): Promise<PlaywrightTestZipReport> => {
  const zipReader = new ZipReader(new Data64URIReader(base64String))
  const _zipEntries = await zipReader.getEntries()
  const zipEntries: { [name: string]: Entry } = {}
  _zipEntries.forEach(ze => zipEntries[ze.filename] = ze)

  const entry = async (name: string): Promise<any> => {
    const _entry = zipEntries[name]
    const writer = new TextWriter()
    await _entry.getData(writer)
    const json = await writer.getData()
    return JSON.parse(json)
  }

  const json = await entry('report.json')

  return {
    json: () => json,
    entry,
  }
}

export type PlaywrightTestReportItem = {
  id: number
  variantPath: string
  reportData: string
  report: PlaywrightTestZipReport
}

export type PlaywrightTestReportItems = {
  [id: number]: PlaywrightTestReportItem
}

export type PlaywrightTestReportItemOptions = { id?: number, variantPath: string, reportData: string }

export type PlaywrightTestReportService = {
  items: PlaywrightTestReportItems
  add: (item: PlaywrightTestReportItemOptions) => Promise<PlaywrightTestReportItem>
  getByVariantPath: (variantPath: string) => PlaywrightTestReportItem | null
  remove: (id: number) => void
  clear: () => void
}

let nextId = 0
const generateId = () => nextId += 1
const resetId = () => {
  nextId = 0
}

let variantPathToId: { [variantPath: string]: number } = {}

export const playwrightTestReportService: PlaywrightTestReportService = {
  items: { },
  add: async itemOptions => {
    const report = await createZipReport(itemOptions.reportData)
    const item: PlaywrightTestReportItem = {
      id: itemOptions.id ?? generateId(),
      variantPath: itemOptions.variantPath,
      reportData: itemOptions.reportData,
      report,
    }
    playwrightTestReportService.items[item.id] = item
    variantPathToId[itemOptions.variantPath] = item.id
    return item
  },
  getByVariantPath: variantPath => {
    const id = variantPathToId[variantPath]
    if (id == null)
      return null

    return playwrightTestReportService.items[id]
  },
  clear: () => {
    playwrightTestReportService.items = {}
    variantPathToId = {}
    resetId()
  },
  remove: id => delete playwrightTestReportService.items[id],
}
