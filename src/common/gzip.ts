import * as fs from 'fs'
import { deflate } from 'pako'
import path from 'path'

const gzipFile = (info: { filePath: string, sizeKb: number }) => {
  const data = fs.readFileSync(info.filePath)
  const compressed = deflate(data)
  const outputFilePath = info.filePath.concat('.gz')
  fs.writeFileSync(outputFilePath, compressed)
}

export const gzipLargeFiles = (outputDir: string, minimumSizeKb: number = 100) => {
  const fileNames = fs.readdirSync(outputDir)
  fileNames
    .map(fileName => {
      const filePath = path.resolve(outputDir, fileName)
      const stat = fs.statSync(path.resolve(outputDir, filePath))
      return { filePath, stat, sizeKb: stat.size / 1024 }
    })
    .filter(info => info.sizeKb > minimumSizeKb)
    .forEach(info => gzipFile(info))
}
