import axios, { AxiosHeaders, AxiosRequestConfig } from 'axios'

import { getAdminAuthToken } from '../utils/getAdminAuthToken'
import {
  logBulkApiRequest,
  logBulkApiResponse,
  serializeAxiosHeaders,
} from '../utils/httpDebugLog'
import { BULK_IMPORT_API_PATH } from './bulkExportClient'

export interface BulkImportRequestConfig extends AxiosRequestConfig {
  account?: string
}

const bulkImportClient = axios.create()

bulkImportClient.defaults.baseURL = BULK_IMPORT_API_PATH
bulkImportClient.defaults.withCredentials = true

const setRequestHeader = (
  config: AxiosRequestConfig,
  name: string,
  value: string
) => {
  if (!config.headers) {
    config.headers = new AxiosHeaders()
  }

  if (config.headers instanceof AxiosHeaders) {
    config.headers.set(name, value)

    return
  }

  ;(config.headers as Record<string, string>)[name] = value
}

bulkImportClient.interceptors.request.use(config => {
  const requestConfig = config as BulkImportRequestConfig
  const { account } = requestConfig

  if (!account) {
    return config
  }

  const token = getAdminAuthToken(account)

  if (token) {
    setRequestHeader(config, 'VtexIdclientAutCookie', token)
  }

  if (config.url && !config.url.includes('an=')) {
    const separator = config.url.includes('?') ? '&' : '?'

    config.url = `${config.url}${separator}an=${encodeURIComponent(account)}`
  }

  delete requestConfig.account

  logBulkApiRequest('Import', {
    method: config.method,
    url: `${config.baseURL ?? ''}${config.url ?? ''}`,
    account,
    hasAuthToken: Boolean(token),
    headers: serializeAxiosHeaders(config.headers),
    body: config.data,
  })

  return config
})

bulkImportClient.interceptors.response.use(
  response => {
    logBulkApiResponse('Import', {
      method: response.config.method,
      url: `${response.config.baseURL ?? ''}${response.config.url ?? ''}`,
      status: response.status,
      statusText: response.statusText,
      body: response.data,
    })

    return response
  },
  error => {
    const { config, response } = error

    logBulkApiResponse('Import', {
      method: config?.method,
      url: `${config?.baseURL ?? ''}${config?.url ?? ''}`,
      status: response?.status ?? 0,
      statusText: response?.statusText ?? error.message,
      body: response?.data ?? { message: error.message },
    })

    return Promise.reject(error)
  }
)

export default bulkImportClient
