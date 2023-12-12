import type { UploadFinishedData } from '@vtex/bulk-import-ui'
import { ReportInformation, ReportListItem } from '@vtex/bulk-import-ui'
import React from 'react'
import { csx } from '@vtex/admin-ui'

import type {
  ErrorRowReportData,
  UploadFileResult,
} from '../../types/BulkImport'
import ReportInformationDetails from './ReportInformationDetails'
import useErrorCount from '../../hooks/useErrorCount'
import { useTranslate } from '../../hooks'

const ReportScreen = ({ data }: UploadFinishedData<UploadFileResult>) => {
  const getErrorCount = useErrorCount()

  const { translate: t } = useTranslate()

  const { lastUpdateDate, accountName, fileName } = data.fileData

  const error = data.error as ErrorRowReportData[]

  return (
    <>
      <ReportInformation
        status="error"
        title={t('reportScreenTitle', {
          errorCount: getErrorCount(error as ErrorRowReportData[]),
        })}
        description={t('reportScreenDescription', {
          fileName,
          userName: accountName,
          uploadedDate: lastUpdateDate,
        })}
        className={csx({ marginBottom: '$space-4' })}
      />
      <ReportInformationDetails variant="Upload" />
      <ReportListItem
        tone="secondary"
        showBullet={false}
        label={t('reportScreenLabel')}
        locators={[getErrorCount(error as ErrorRowReportData[])]}
        className={csx({ marginTop: '$space-4' })}
      />
      {error.map(({ title, errorCount }, index) => (
        <ReportListItem
          key={index}
          type={errorCount > 0 ? 'error' : 'success'}
          label={title}
          locators={[errorCount]}
        />
      ))}
    </>
  )
}

export default ReportScreen
