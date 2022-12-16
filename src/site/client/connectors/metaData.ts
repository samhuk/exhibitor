import { MetaData } from '../../../common/metadata'
import { get } from './core'

export const fetchMetaData = () => get<MetaData>(
  'metaData',
)
