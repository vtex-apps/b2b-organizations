export const POLL_INTERVAL_MS = 4000

export type BulkExportStatusCode = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

export interface BulkExportStatusResult {
  exportId: string
  status: BulkExportStatusCode
  progressPercentage: number | null
  percentage: number | null
  exportedRows: number | null
  totalRows: number | null
  linkToFile: string | null
  lastUpdate: string | null
  startDate: string | null
}

const parseNumber = (value: unknown): number | null => {
  if (value == null || value === '') {
    return null
  }

  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : null
}

export const resolveProgressPercentage = (
  response: BulkExportStatusResult
): number | null => {
  let progress =
    parseNumber(response.progressPercentage) ?? parseNumber(response.percentage)

  if (progress != null && progress > 0 && progress <= 1) {
    progress = Math.round(progress * 100)
  } else if (progress != null) {
    progress = Math.round(progress)
  }

  const exportedRows = parseNumber(response.exportedRows)
  const totalRows = parseNumber(response.totalRows)

  if (
    (progress == null || progress === 0) &&
    exportedRows != null &&
    totalRows != null &&
    totalRows > 0
  ) {
    progress = Math.round((exportedRows / totalRows) * 100)
  }

  if (
    progress == null ||
    (progress === 0 && exportedRows != null && exportedRows > 0)
  ) {
    return null
  }

  return Math.min(100, Math.max(0, progress))
}

export const getDisplayProgressPercentage = (
  statusData: BulkExportStatusResult,
  isInProgress?: boolean
): number | null => {
  const progress = resolveProgressPercentage(statusData)

  if (isInProgress && progress === 100) {
    return 99
  }

  return progress
}

export const isExportInProgress = (state: string) =>
  state === 'CREATING' || state === 'POLLING'
