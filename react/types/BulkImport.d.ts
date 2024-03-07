import type { UploadFinishedData } from '@vtex/bulk-import-ui'

type ImportState =
  | 'InProgress'
  | 'InValidation'
  | 'ReadyToImport'
  | 'Completed'
  | 'ValidationFailed'
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
  importResult?: {
    imports: ImportResult[]
    reportDownloadLink: string
  }
  percentage: string
  lastUpdateDate: string
  importState: ImportState
  importedAt: string
  importedUserEmail: string
  importedUserName: string
  validationResult?: {
    reportDownloadLink: string
    validationResult: ValidationResult[]
  }
}

export type UploadFileResult = {
  successCount?: number
  fileData: ImportDetails
}

export type ValidationResult = {
  name: string
  validRows: number
  invalidRows: number
}

export type FieldValidationError = {
  description?: string
  error: 'FieldValidationError'
  errorDownloadLink: string
  validationResult: ValidationResult[]
  fileName?: string
}

export type AnotherImportInProgress = {
  description: string
  error: 'AnotherImportInProgress'
  fileName?: string
}

export type BulkImportUploadError =
  | FieldValidationError
  | AnotherImportInProgress

export type UploadFileData = UploadFinishedData<
  UploadFileResult,
  BulkImportUploadError
>
