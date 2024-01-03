import React from 'react'
import { SuccessScreen } from '@vtex/bulk-import-ui'

import type { UploadFileResult } from '../../types/BulkImport'
import { useTranslate } from '../../hooks'

const ReportSuccessScreen = ({ successCount, fileData }: UploadFileResult) => {
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
