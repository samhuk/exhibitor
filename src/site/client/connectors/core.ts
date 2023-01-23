import { of, lastValueFrom } from 'rxjs'
import { ajax, AjaxError, AjaxResponse } from 'rxjs/ajax'
import { map, catchError } from 'rxjs/operators'
import { SerializedExhError } from '../../../common/exhError/serialization/types'
import { ExhResponse } from '../../common/responses'

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' }
const DEFAULT_TIMEOUT = 30000

export const localUrlPrefix = () => `${window.location.protocol}//${window.location.host}`

const localApiUrlPrefix = (relativeUrl: string) => `${localUrlPrefix()}/api/${relativeUrl}`

const mapValueToQueryParameterValue = (v: string|number|boolean): string => (v != null
  ? encodeURIComponent(typeof v === 'string' ? v : v.toString())
  : ''
)

export const parseQueryParameters = (queryParameters: { [param: string]: string|number|boolean }): string => {
  if (queryParameters == null || Object.keys(queryParameters).length === 0)
    return ''

  return '?'.concat(Object.entries(queryParameters).map(([k, v]) => `${k}=${mapValueToQueryParameterValue(v)}`).join('&'))
}

export const get = <TResponseData>(
  url: string,
  queryParameters?: { [param: string]: string|number|boolean },
  options?: {
    headers?: { [headerName: string]: string },
    responseType?: XMLHttpRequestResponseType
  },
): Promise<ExhResponse<TResponseData>> => lastValueFrom(ajax({
    url: localApiUrlPrefix(url).concat(parseQueryParameters(queryParameters)),
    method: 'GET',
    headers: options?.headers ?? DEFAULT_HEADERS,
    responseType: options?.responseType ?? 'json',
    timeout: DEFAULT_TIMEOUT,
    withCredentials: true,
  }).pipe(
    map(res => (res as AjaxResponse<ExhResponse<TResponseData>>).response),
    catchError((err: AjaxError) => {
      if (err.name === 'AjaxTimeoutError') {
        const serializedError: SerializedExhError = {
          message: 'request timeout',
        }
        // eslint-disable-next-line no-param-reassign
        err.response = serializedError
      }
      return of(err.response as ExhResponse<TResponseData>)
    }),
  ))

export const post = <TResponseData>(
  url: string,
  body: any,
  queryParameters?: { [param: string]: any },
  options?: {
    headers?: { [headerName: string]: string },
    responseType?: XMLHttpRequestResponseType
  },
): Promise<ExhResponse<TResponseData>> => lastValueFrom(ajax({
    url: localApiUrlPrefix(url).concat(parseQueryParameters(queryParameters)),
    method: 'POST',
    headers: options?.headers ?? DEFAULT_HEADERS,
    responseType: options?.responseType ?? 'json',
    body: JSON.stringify(body),
    timeout: DEFAULT_TIMEOUT,
    withCredentials: true,
  }).pipe(
    map(res => (res as AjaxResponse<ExhResponse<TResponseData>>).response),
    catchError((err: AjaxError) => {
      if (err.name === 'AjaxTimeoutError') {
        const serializedError: SerializedExhError = {
          message: 'request timeout',
        }
        // eslint-disable-next-line no-param-reassign
        err.response = serializedError
      }
      return of(err.response as ExhResponse<TResponseData>)
    }),
  ))
