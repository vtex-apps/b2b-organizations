type ImportState =
  | 'ReadyToImport'
  | 'InProgress'
  | 'Completed'
  | 'CompletedWithError'
  | 'Failed'

export type ImportResult = {
  name: string
  importedRows: number
  rowsWithError: number
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

export type ErrorRowReportData = {
  title: string
  errorCount: number
}

export type ImportReportData = {
  title: string
  success: {
    percentage: number
    imports: number
  }
  error: {
    percentage: number
    imports: number
  }
}

export type ImportDetails = {
  importId: string
  accountName: string
  fileName: string
  importResult?: { imports: ImportResult[] }
  percentage: string
  lastUpdateDate: string
  importState: ImportState
}

export type UploadFileResult = {
  successCount?: number
  fileData: ImportDetails
  error?: ErrorRowReportData[] | Error
}
