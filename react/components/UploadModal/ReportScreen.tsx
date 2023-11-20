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

const ReportScreen = ({ data }: UploadFinishedData<UploadFileResult>) => {
  const getErrorCount = useErrorCount()

  const { uploadedDate, userName, fileName } = data.fileData

  const error = data.error as ErrorRowReportData[]

  return (
    <>
      <ReportInformation
        status="error"
        title={`We found ${getErrorCount(
          error as ErrorRowReportData[]
        )} errors in this file.`}
        description={`File ${fileName} uploaded by ${userName} on ${uploadedDate}`}
        className={csx({ marginBottom: '$space-4' })}
      />
      <ReportInformationDetails variant="Upload" />
      <ReportListItem
        tone="secondary"
        showBullet={false}
        label="Total errors"
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
