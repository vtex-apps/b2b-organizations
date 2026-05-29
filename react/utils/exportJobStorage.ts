import storageFactory from './storage'

const sessionStore = storageFactory(() => sessionStorage)

export type StoredExportType =
  | 'organizations'
  | 'cost_centers'
  | 'members'
  | 'addresses'

export type StoredExportStatus = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

export interface StoredExportJob {
  exportId: string
  pollStartedAt: number
  status: StoredExportStatus
  linkToFile?: string | null
  progressPercentage?: number | null
  exportedRows?: number | null
}

const getStorageKey = (exportType: StoredExportType) =>
  `b2b-export-job-${exportType}`

export const getStoredExportJob = (
  exportType: StoredExportType
): StoredExportJob | null => {
  const raw = sessionStore.getItem(getStorageKey(exportType))

  if (!raw) return null

  try {
    return JSON.parse(raw) as StoredExportJob
  } catch {
    sessionStore.removeItem(getStorageKey(exportType))

    return null
  }
}

export const saveStoredExportJob = (
  exportType: StoredExportType,
  job: StoredExportJob
) => {
  sessionStore.setItem(getStorageKey(exportType), JSON.stringify(job))
}

export const clearStoredExportJob = (exportType: StoredExportType) => {
  sessionStore.removeItem(getStorageKey(exportType))
}
