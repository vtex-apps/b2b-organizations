export type ExportType =
  | 'organizations'
  | 'cost_centers'
  | 'members'
  | 'addresses'

export const ALL_EXPORT_TYPES: ExportType[] = [
  'organizations',
  'cost_centers',
  'members',
  'addresses',
]

export type ExportState = 'IDLE' | 'CREATING' | 'POLLING' | 'READY' | 'ERROR'

export interface ExportJobUIState {
  state: ExportState
  progressPercentage: number | null
  exportedRows: number | null
  linkToFile: string | null
}

export const createIdleExportJob = (): ExportJobUIState => ({
  state: 'IDLE',
  progressPercentage: null,
  exportedRows: null,
  linkToFile: null,
})

export const createInitialExportJobs = (): Record<
  ExportType,
  ExportJobUIState
> => ({
  organizations: createIdleExportJob(),
  cost_centers: createIdleExportJob(),
  members: createIdleExportJob(),
  addresses: createIdleExportJob(),
})
