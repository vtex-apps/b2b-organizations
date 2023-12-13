import React from 'react'
import { ErrorScreen } from '@vtex/bulk-import-ui'

import type { AnotherImportInProgress } from '../../types/BulkImport'

type ReportErrorScreenProps = AnotherImportInProgress | null

const ReportErrorScreen = (data: ReportErrorScreenProps) => {
  return <ErrorScreen fileName={data?.description} />
}

export default ReportErrorScreen
