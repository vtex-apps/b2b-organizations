import React from 'react'
import type { UploadFinishedData } from '@vtex/bulk-import-ui'
import { SuccessScreen } from '@vtex/bulk-import-ui'

import type { UploadFileResult } from '../../types/BulkImport'

const ReportSuccessScreen = ({
  data,
}: UploadFinishedData<UploadFileResult>) => {
  const successCountMessage =
    typeof data.successCount === 'number'
      ? `${data.successCount} Buyer Organizations`
      : undefined

  return (
    <SuccessScreen
      fileName={data.fileData?.fileName}
      extra={successCountMessage}
    />
  )
}

export default ReportSuccessScreen
