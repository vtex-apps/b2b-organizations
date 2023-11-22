import React from 'react'
import type { UploadFinishedData } from '@vtex/bulk-import-ui'
import { ErrorScreen } from '@vtex/bulk-import-ui'

import type { UploadFileResult } from '../../types/BulkImport'
import useErrorCount from '../../hooks/useErrorCount'

const ReportErrorScreen = ({ data }: UploadFinishedData<UploadFileResult>) => {
  const getErrorCount = useErrorCount()

  const errorCount = Array.isArray(data.error)
    ? getErrorCount(data.error)
    : undefined

  return (
    <ErrorScreen fileName={data.fileData?.fileName} errorCount={errorCount} />
  )
}

export default ReportErrorScreen
