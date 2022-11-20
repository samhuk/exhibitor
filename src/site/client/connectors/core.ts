import { of, lastValueFrom } from 'rxjs'
import { ajax, AjaxError, AjaxResponse } from 'rxjs/ajax'
import { map, catchError } from 'rxjs/operators'
import { ResponseBase } from '../../common/responses'

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' }

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
  headers: { [headerName: string]: string } = DEFAULT_HEADERS,
  responseType: XMLHttpRequestResponseType = 'json',
) => lastValueFrom(ajax({
    url: localApiUrlPrefix(url).concat(parseQueryParameters(queryParameters)),
    method: 'GET',
    headers,
    responseType,
    timeout: 10000,
    withCredentials: true,
  }).pipe(
    map(res => (res as AjaxResponse<ResponseBase<TResponseData>>).response),
    catchError((err: AjaxError) => {
      if (err.name === 'AjaxTimeoutError') {
        const timeoutResponse: ResponseBase = {
          data: false,
          error: {
            statusCode: 500,
            type: 'timeout',
            data: null,
            stack: null,
          },
        }
        // eslint-disable-next-line no-param-reassign
        err.response = timeoutResponse
      }
      return of(err.response as ResponseBase<TResponseData>)
    }),
  ))

export const post = <TResponseData>(
  url: string,
  body: any,
  queryParameters?: { [param: string]: any },
  headers: { [headerName: string]: string } = DEFAULT_HEADERS,
  responseType: XMLHttpRequestResponseType = 'json',
) => lastValueFrom(ajax({
    url: localApiUrlPrefix(url).concat(parseQueryParameters(queryParameters)),
    method: 'POST',
    headers,
    responseType,
    body: JSON.stringify(body),
    timeout: 10000,
    withCredentials: true,
  }).pipe(
    map(res => (res as AjaxResponse<ResponseBase<TResponseData>>).response),
    catchError((err: AjaxError) => {
      if (err.name === 'AjaxTimeoutError') {
        const timeoutResponse: ResponseBase = {
          data: false,
          error: {
            statusCode: 500,
            type: 'timeout',
            data: null,
            stack: null,
          },
        }
        // eslint-disable-next-line no-param-reassign
        err.response = timeoutResponse
      }
      return of(err.response as ResponseBase<TResponseData>)
    }),
  ))
