import React from 'react'
import type { UploadFinishedData } from '@vtex/bulk-import-ui'
import { SuccessScreen } from '@vtex/bulk-import-ui'

import type { UploadFileResult } from '../../types/BulkImport'
import { useTranslate } from '../../hooks'

const ReportSuccessScreen = ({
  data: { successCount, fileData },
}: UploadFinishedData<UploadFileResult>) => {
  const { translate: t } = useTranslate()

  const successCountMessage =
    typeof successCount === 'number'
      ? t('reportScreenSuccessCount', { successCount })
      : undefined

  return (
    <SuccessScreen fileName={fileData?.fileName} extra={successCountMessage} />
  )
}

export default ReportSuccessScreen
