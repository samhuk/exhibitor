import * as fs from 'fs'
import { deflate } from 'pako'
import path from 'path'

const GZIP_EXT = '.gz'

const gzipFile = (info: { filePath: string, sizeKb: number }) => {
  const data = fs.readFileSync(info.filePath)
  const compressed = deflate(data)
  const outputFilePath = info.filePath.concat(GZIP_EXT)
  fs.writeFileSync(outputFilePath, compressed)
}

export const gzipLargeFiles = (outputDir: string, minimumSizeKb: number = 100) => {
  const fileNames = fs.readdirSync(outputDir)
  fileNames
    // Ignore any files already with the .gz extension
    .filter(fileName => path.extname(fileName) !== GZIP_EXT)
    .map(fileName => {
      const filePath = path.resolve(outputDir, fileName)
      const stat = fs.statSync(path.resolve(outputDir, filePath))
      return { filePath, stat, sizeKb: stat.size / 1024 }
    })
    .filter(info => info.sizeKb > minimumSizeKb)
    .forEach(info => gzipFile(info))
}
