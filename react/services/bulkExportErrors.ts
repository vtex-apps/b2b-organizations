export class BulkExportRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BulkExportRequestError'
  }
}

export class BulkExportSessionError extends BulkExportRequestError {
  constructor(message = 'Admin session not found. Please log in again.') {
    super(message)
    this.name = 'BulkExportSessionError'
  }
}
