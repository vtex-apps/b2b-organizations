import type { ExportType } from './exportTypes'

export const POLL_INTERVAL_MS = 2000
export const MAX_STATUS_POLL_FAILURES = 5
export const STALE_STATUS_TIMEOUT_MS = 5 * 60 * 1000

export interface ExportStatusData {
  exportStatus: {
    exportId: string
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
    progressPercentage: number | null
    exportedRows: number | null
    linkToFile: string | null
    lastUpdate: string | null
    startDate: string | null
  }
}

export type ExportStatusResult = ExportStatusData['exportStatus']

export const getExportStatusSnapshot = (status: ExportStatusResult): string =>
  JSON.stringify({
    status: status.status,
    progressPercentage: status.progressPercentage,
    exportedRows: status.exportedRows,
    linkToFile: status.linkToFile,
    lastUpdate: status.lastUpdate,
  })

export const getStatusActivityTimestamp = (
  status: ExportStatusResult
): number | null => {
  if (!status.lastUpdate) {
    return null
  }

  const timestamp = Date.parse(status.lastUpdate)

  return Number.isFinite(timestamp) ? timestamp : null
}

export const isExportStatusStale = (
  statusData: ExportStatusResult,
  snapshotSinceMs: number | undefined,
  now = Date.now()
): boolean => {
  const activityTimestamp = getStatusActivityTimestamp(statusData)
  const sinceMs = snapshotSinceMs ?? activityTimestamp ?? now

  return now - sinceMs >= STALE_STATUS_TIMEOUT_MS
}

export const getGraphQLErrorMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== 'object') return undefined

  const graphQLErrors = (error as { graphQLErrors?: Array<{ message?: string }> })
    .graphQLErrors

  return graphQLErrors?.[0]?.message
}

const getFilenameFromContentDisposition = (header: string | null): string | null => {
  if (!header) return null

  const filenameMatch = header.match(/filename="?([^";]+)"?/i)

  return filenameMatch?.[1] ?? null
}

const getDefaultFilename = (exportType: ExportType) => {
  const date = new Date().toISOString().slice(0, 10)

  return `b2b-export-${exportType}-${date}.csv`
}

export const getDisplayProgressPercentage = (
  apiPercentage: number | null,
  rowsExported: number | null,
  totalItems?: number,
  isInProgress?: boolean
): number | null => {
  let percentage: number | null = null
  const rowsBasedPercentage =
    rowsExported != null && totalItems != null && totalItems > 0
      ? Math.min(100, Math.round((rowsExported / totalItems) * 100))
      : null

  if (rowsBasedPercentage != null) {
    percentage = rowsBasedPercentage
  } else if (apiPercentage != null) {
    percentage = apiPercentage
  }

  if (isInProgress && percentage === 100) {
    return 99
  }

  return percentage
}

export const downloadCsvFile = async (
  linkToFile: string,
  exportType: ExportType
) => {
  const response = await fetch(linkToFile, { credentials: 'include' })

  if (!response.ok) {
    throw new Error(response.status === 403 ? 'FORBIDDEN' : 'DOWNLOAD_FAILED')
  }

  const blob = await response.blob()
  const filename =
    getFilenameFromContentDisposition(
      response.headers.get('Content-Disposition')
    ) ?? getDefaultFilename(exportType)

  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export const isExportInProgress = (state: string) =>
  state === 'CREATING' || state === 'POLLING' || state === 'DOWNLOADING'
