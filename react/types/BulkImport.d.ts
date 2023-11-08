export type ImportDetails = {
  importId: string
  status: 'ReadyToImport' | 'InProgress' | 'Completed' | 'CompletedWithError'
  filename: string
  lastUpdate?: string
  startDate?: string
  importUser?: string
  progressPercentage?: number
  result?: ImportResult
}

export type ImportResult = {
  importedRows: number
  rowsWithError: number
  errors: LineError[]
}

export type ImportError = {
  error: 'InvalidFileType' | 'InvalidFileSize' | 'FieldValidationError'
  lineErrors: LineError[]
}

export type LineError = {
  line: number
  displayTitle: string
  errors: FieldError[]
}

export type FieldError = {
  error: 'MissingRequiredField'
  description: string
  column: string
}
