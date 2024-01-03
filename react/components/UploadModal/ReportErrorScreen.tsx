import React from 'react'
import { ErrorScreen } from '@vtex/bulk-import-ui'

import type { BulkImportUploadError } from '../../types/BulkImport'
import useErrorCount from '../../hooks/useErrorCount'

type ReportErrorScreenProps = BulkImportUploadError | null

const ReportErrorScreen = (data: ReportErrorScreenProps) => {
  const getErrorCount = useErrorCount()

  if (data?.error === 'FieldValidationError') {
    const errorCount = Array.isArray(data.validationResult)
      ? getErrorCount(data.validationResult)
      : undefined

    return <ErrorScreen fileName={data.fileName} errorCount={errorCount} />
  }

  return <ErrorScreen fileName={data?.description} />
}

export default ReportErrorScreen
