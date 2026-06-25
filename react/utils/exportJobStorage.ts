import {
  ALL_EXPORT_TYPES,
  createIdleExportJob,
  createInitialExportJobs,
} from './exportTypes'
import type { ExportJobUIState, ExportType } from './exportTypes'

const STORAGE_KEY_PREFIX = 'b2b-organizations-export-jobs'

export interface StoredExportSession {
  jobs: Record<ExportType, ExportJobUIState>
  exportIds: Partial<Record<ExportType, string>>
}

export const getExportJobsStorageKey = (account: string): string =>
  `${STORAGE_KEY_PREFIX}:${account}`

const isExportJobUIState = (value: unknown): value is ExportJobUIState => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const job = value as ExportJobUIState

  return typeof job.state === 'string'
}

export const loadExportJobsSession = (
  account: string
): StoredExportSession | null => {
  if (typeof sessionStorage === 'undefined') {
    return null
  }

  try {
    const raw = sessionStorage.getItem(getExportJobsStorageKey(account))

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as StoredExportSession

    if (!parsed?.jobs || typeof parsed.jobs !== 'object') {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export const saveExportJobsSession = (
  account: string,
  session: StoredExportSession
): void => {
  if (typeof sessionStorage === 'undefined') {
    return
  }

  const key = getExportJobsStorageKey(account)
  const hasPersistedJobs = ALL_EXPORT_TYPES.some(
    type => session.jobs[type]?.state !== 'IDLE'
  )

  if (!hasPersistedJobs) {
    sessionStorage.removeItem(key)

    return
  }

  sessionStorage.setItem(key, JSON.stringify(session))
}

const normalizeRestoredJob = (
  job: ExportJobUIState,
  exportId?: string
): ExportJobUIState => {
  if (job.state === 'DOWNLOADING' && job.linkToFile) {
    return { ...job, state: 'READY' }
  }

  if (
    (job.state === 'CREATING' || job.state === 'POLLING') &&
    !exportId
  ) {
    return createIdleExportJob()
  }

  return job
}

export const restoreExportJobsSession = (
  stored: StoredExportSession | null
): {
  jobs: Record<ExportType, ExportJobUIState>
  exportIds: Partial<Record<ExportType, string>>
} => {
  const jobs = createInitialExportJobs()
  const exportIds: Partial<Record<ExportType, string>> = {}

  if (!stored) {
    return { jobs, exportIds }
  }

  ALL_EXPORT_TYPES.forEach(exportType => {
    const storedJob = stored.jobs?.[exportType]
    const exportId = stored.exportIds?.[exportType]

    if (!isExportJobUIState(storedJob)) {
      return
    }

    const normalizedJob = normalizeRestoredJob(storedJob, exportId)

    if (normalizedJob.state !== 'IDLE') {
      jobs[exportType] = normalizedJob
    }

    if (
      exportId &&
      (normalizedJob.state === 'CREATING' || normalizedJob.state === 'POLLING')
    ) {
      exportIds[exportType] = exportId
    }
  })

  return { jobs, exportIds }
}
