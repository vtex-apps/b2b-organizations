export type ImportDetails = {
  importId: string
  accountName: string
  fileName: string
  importResult: ImportResult
  percentage: string
  lastUpdateDate: string
  importState:
    | 'ReadyToImport'
    | 'InProgress'
    | 'Completed'
    | 'CompletedWithError'
    | 'Failed'
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

export type ErrorRowReportData = {
  title: string
  errorCount: number
}

export type UploadFileResult = {
  successCount?: number
  fileData: {
    uploadedDate: string
    userName: string
    fileName: string
  }
  error?: ErrorRowReportData[] | Error
}

export interface ImportReportData {
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
