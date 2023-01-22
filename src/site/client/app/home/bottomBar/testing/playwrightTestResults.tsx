import React, { useState, useEffect } from 'react'
import { Data64URIReader, Entry, TextWriter, ZipReader } from '@zip.js/zip.js'

import { ReportView } from '../../../../../../external/playwright-html-reporter/src/reportView'

type ZipReport = {
  json: () => any
  entry: (name: string) => Promise<any>
}

const createZipReport = async (base64String: string): Promise<ZipReport> => {
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

const render = (props: {
  results: string
}) => {
  const [report, setReport] = useState<ZipReport | undefined>()

  useEffect(() => {
    if (report != null)
      return

    createZipReport(props.results).then(setReport)
  }, [props.results])

  return <ReportView report={report} />
}

export default render
