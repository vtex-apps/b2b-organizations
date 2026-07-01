import { buildBulkExportUrl } from './bulkExportClient'
import {
  BulkExportRequestError,
  BulkExportSessionError,
} from './bulkExportErrors'
import type { ExportType } from '../utils/exportTypes'
import { getAdminAuthToken } from '../utils/getAdminAuthToken'
import type { BulkExportStatusResult } from '../utils/exportHelpers'

const sleep = (ms: number) =>
  new Promise<void>(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })

const parseNumber = (value: unknown): number | null => {
  if (value == null || value === '') {
    return null
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

const pickField = (raw: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) {
    if (raw[key] != null) {
      return raw[key]
    }
  }

  return undefined
}

const mapBulkExportStatus = (
  status: unknown
): BulkExportStatusResult['status'] => {
  if (typeof status === 'string') {
    const normalized = status.toLowerCase()

    if (normalized === 'inprogress') {
      return 'IN_PROGRESS'
    }

    if (normalized === 'completed') {
      return 'COMPLETED'
    }

    if (normalized === 'failed') {
      return 'FAILED'
    }
  }

  const numericStatus = parseNumber(status)

  switch (numericStatus) {
    case 0:
      return 'IN_PROGRESS'

    case 1:
      return 'COMPLETED'

    case 2:
      return 'FAILED'

    default:
      return 'FAILED'
  }
}

export const normalizeBulkExportStatus = (
  raw: Record<string, unknown>
): BulkExportStatusResult => {
  const exportId = pickField(raw, 'exportId', 'ExportId')

  return {
    exportId: typeof exportId === 'string' ? exportId : '',
    status: mapBulkExportStatus(pickField(raw, 'status', 'Status')),
    progressPercentage: parseNumber(
      pickField(raw, 'progressPercentage', 'ProgressPercentage')
    ),
    percentage: parseNumber(pickField(raw, 'percentage', 'Percentage')),
    exportedRows: parseNumber(pickField(raw, 'exportedRows', 'ExportedRows')),
    totalRows: parseNumber(pickField(raw, 'totalRows', 'TotalRows')),
    linkToFile:
      typeof pickField(raw, 'linkToFile', 'LinkToFile') === 'string'
        ? (pickField(raw, 'linkToFile', 'LinkToFile') as string)
        : null,
    lastUpdate:
      typeof pickField(raw, 'lastUpdate', 'LastUpdate') === 'string'
        ? (pickField(raw, 'lastUpdate', 'LastUpdate') as string)
        : null,
    startDate:
      typeof pickField(raw, 'startDate', 'StartDate') === 'string'
        ? (pickField(raw, 'startDate', 'StartDate') as string)
        : null,
  }
}

const parseErrorBody = async (
  response: Response
): Promise<string | undefined> => {
  try {
    const text = await response.text()

    if (!text.trim()) {
      return undefined
    }

    try {
      const payload = JSON.parse(text) as Record<string, unknown>

      if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message
      }

      if (typeof payload.error === 'string' && payload.error.trim()) {
        return payload.error
      }
    } catch {
      return text
    }
  } catch {
    return undefined
  }

  return undefined
}

const bulkImportFetch = async (
  account: string,
  exportId: string | undefined,
  init: RequestInit = {}
): Promise<Response> => {
  const token = getAdminAuthToken(account)
  const headers = new Headers(init.headers ?? {})

  headers.set('Accept', 'application/json')

  if (token) {
    headers.set('VtexIdclientAutCookie', token)
  }

  const url = buildBulkExportUrl(account, exportId)

  const response = await fetch(url, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (response.status === 401 || response.status === 403) {
    throw new BulkExportSessionError()
  }

  return response
}

const requestJson = async <T>(
  account: string,
  exportId: string | undefined,
  init?: RequestInit
): Promise<T> => {
  const response = await bulkImportFetch(account, exportId, init)

  if (!response.ok) {
    const message =
      (await parseErrorBody(response)) ?? `Request failed (${response.status})`

    throw new BulkExportRequestError(message)
  }

  return response.json() as Promise<T>
}

export const extractApiErrorMessage = (error: unknown): string | undefined => {
  if (error instanceof BulkExportRequestError) {
    return error.message
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  if (!error || typeof error !== 'object') {
    return undefined
  }

  const responseData = (error as { response?: { data?: unknown } }).response
    ?.data

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData
  }

  if (responseData && typeof responseData === 'object') {
    const payload = responseData as Record<string, unknown>

    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message
    }

    if (typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error
    }
  }

  return undefined
}

export const createBulkExport = async (
  account: string,
  exportType: ExportType
): Promise<string | null> => {
  const formData = new FormData()

  formData.append('exportType', exportType)

  const data = await requestJson<{ exportId?: string }>(account, undefined, {
    method: 'POST',
    body: formData,
  })

  const exportId = data?.exportId

  return exportId?.trim() ? exportId : null
}

export const getBulkExportStatus = async (
  account: string,
  exportId: string
): Promise<BulkExportStatusResult> => {
  const data = await requestJson<Record<string, unknown>>(account, exportId, {
    method: 'GET',
  })

  return normalizeBulkExportStatus(data ?? {})
}

export const POLL_STATUS_RETRY_DELAYS_MS = [1000, 2000, 3000]

const getBulkExportStatusWithRetryAttempt = async (
  account: string,
  exportId: string,
  delayIndex: number
): Promise<BulkExportStatusResult> => {
  try {
    return await getBulkExportStatus(account, exportId)
  } catch (error) {
    if (delayIndex >= POLL_STATUS_RETRY_DELAYS_MS.length) {
      throw error
    }

    await sleep(POLL_STATUS_RETRY_DELAYS_MS[delayIndex])

    return getBulkExportStatusWithRetryAttempt(
      account,
      exportId,
      delayIndex + 1
    )
  }
}

export const getBulkExportStatusWithRetry = (
  account: string,
  exportId: string
): Promise<BulkExportStatusResult> =>
  getBulkExportStatusWithRetryAttempt(account, exportId, 0)
