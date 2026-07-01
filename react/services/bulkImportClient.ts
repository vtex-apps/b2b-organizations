import type { AxiosRequestConfig } from 'axios'
import axios, { AxiosHeaders } from 'axios'

import { getAdminAuthToken } from '../utils/getAdminAuthToken'
import { BULK_IMPORT_API_PATH } from './bulkApiPaths'

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

  const legacyHeaders = config.headers as Record<string, string>

  legacyHeaders[name] = value
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

  return config
})

export default bulkImportClient
