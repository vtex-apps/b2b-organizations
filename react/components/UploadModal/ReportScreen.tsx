import { ReportInformation, ReportListItem } from '@vtex/bulk-import-ui'
import React from 'react'
import { csx } from '@vtex/admin-ui'

import type {
  FieldValidationError,
  ValidationResult,
} from '../../types/BulkImport'
import ReportInformationDetails from './ReportInformationDetails'
import useErrorCount from '../../hooks/useErrorCount'
import { useTranslate } from '../../hooks'

const ReportScreen = (data: FieldValidationError) => {
  const getErrorCount = useErrorCount()

  const { translate: t } = useTranslate()

  const { fileName, validationResult, errorDownloadLink } = data

  return (
    <>
      <ReportInformation
        status="error"
        title={t('reportScreenTitle', {
          errorCount: getErrorCount(validationResult as ValidationResult[]),
        })}
        description={t('reportScreenDescription', {
          fileName,
          'filename-link': (content: string) => (
            <a href={errorDownloadLink}>{content}</a>
          ),
        })}
        className={csx({ marginBottom: '$space-4' })}
      />
      <ReportInformationDetails
        variant="Upload"
        validationReportDownloadLink={errorDownloadLink}
      />
      <ReportListItem
        tone="secondary"
        showBullet={false}
        label={t('reportScreenLabel')}
        locators={[getErrorCount(validationResult as ValidationResult[])]}
        className={csx({ marginTop: '$space-4' })}
      />
      {(validationResult ?? []).map(({ name, invalidRows }, index) => (
        <ReportListItem
          key={index}
          type={invalidRows > 0 ? 'error' : 'success'}
          label={name}
          locators={[invalidRows]}
        />
      ))}
    </>
  )
}

export default ReportScreen
